package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/pkg/errors"
)

func findBuyerOrders(stub shim.ChaincodeStubInterface, order *Order) error {
	startKey := fmt.Sprintf("%s-%s-%015d-", buyerOrderPrefix, order.EnergyType, order.Price)
	endKey := fmt.Sprintf("%s-%s-%015d-~", buyerOrderPrefix, order.EnergyType, MAX_PRICE)
	iterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return errors.Wrapf(err, "GetStateByRange error")
	}
	buyerOrders := []Order{}
	defer iterator.Close()
	for iterator.HasNext() {
		result, err := iterator.Next()
		if err != nil {
			return errors.Wrapf(err, "Iterator error")
		}
		buyerOrder := Order{}
		key := fmt.Sprintf("%s-%s", orderPrefix, string(result.Value))
		if _, err := GetState(stub, key, &buyerOrder); err != nil {
			return errors.Wrapf(err, "Get order error: %s", string(result.Value))
		}
		amount := order.RemainAmount
		if buyerOrder.RemainAmount < amount {
			amount = buyerOrder.RemainAmount
		}
		err = addTransaction(stub, order, &buyerOrder, amount)
		if err != nil {
			return errors.Wrapf(err, "Add transaction error")
		}

		buyerOrder.RemainAmount -= amount
		buyerOrders = append(buyerOrders, buyerOrder)

		order.RemainAmount -= amount
		if order.RemainAmount == 0 {
			break
		}
	}
	if err := updateOrder(stub, order, false); err != nil {
		return errors.Wrapf(err, "Update order error")
	}
	for _, buyerOrder := range buyerOrders {
		if err := updateOrder(stub, &buyerOrder, true); err != nil {
			return errors.Wrapf(err, "Update order error")
		}
	}
	return nil
}

func findSellerOrders(stub shim.ChaincodeStubInterface, order *Order) error {
	startKey := fmt.Sprintf("%s-%s-%015d-", sellerOrderPrefix, order.EnergyType, 0)
	endKey := fmt.Sprintf("%s-%s-%015d-~", sellerOrderPrefix, order.EnergyType, order.Price)
	iterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return errors.Wrapf(err, "GetStateByRange error")
	}
	sellerOrders := []Order{}
	defer iterator.Close()
	for iterator.HasNext() {
		result, err := iterator.Next()
		if err != nil {
			return errors.Wrapf(err, "Iterator error")
		}
		sellerOrder := Order{}
		key := fmt.Sprintf("%s-%s", orderPrefix, string(result.Value))
		if _, err := GetState(stub, key, &sellerOrder); err != nil {
			return errors.Wrapf(err, "Get order error: %s", string(result.Value))
		}
		amount := order.RemainAmount
		if sellerOrder.RemainAmount < amount {
			amount = sellerOrder.RemainAmount
		}
		err = addTransaction(stub, &sellerOrder, order, amount)
		if err != nil {
			return errors.Wrapf(err, "Add transaction error")
		}

		sellerOrder.RemainAmount -= amount
		sellerOrders = append(sellerOrders, sellerOrder)

		order.RemainAmount -= amount
		if order.RemainAmount == 0 {
			break
		}
	}
	if err := updateOrder(stub, order, true); err != nil {
		return errors.Wrapf(err, "Update order error")
	}
	for _, sellerOrder := range sellerOrders {
		if err := updateOrder(stub, &sellerOrder, false); err != nil {
			return errors.Wrapf(err, "Update order error")
		}
	}
	return nil
}

func addTransaction(stub shim.ChaincodeStubInterface, sellerOrder *Order, buyerOrder *Order, amount int64) error {
	timestamp, err := stub.GetTxTimestamp()
	if err != nil {
		return errors.Wrapf(err, "GetTxTimestamp error")
	}
	transaction := Transaction{
		TransactionId: sellerOrder.OrderId + buyerOrder.OrderId,
		SellerOrderId: sellerOrder.OrderId,
		BuyerOrderId:  buyerOrder.OrderId,
		SellerId:      sellerOrder.UserId,
		BuyerId:       buyerOrder.UserId,
		EnergyType:    sellerOrder.EnergyType,
		Price:         sellerOrder.Price,
		Amount:        amount,
		Time:          timestamp.Seconds,
	}
	key := fmt.Sprintf("%s-%s", transactionPrefix, transaction.TransactionId)
	if err := PutState(stub, key, &transaction); err != nil {
		return errors.Wrapf(err, "Add to transaction table error: %s", key)
	}

	sellerUserTransactions := []Transaction{}
	key = fmt.Sprintf("%s-%s", userTransactionsPrefix, sellerOrder.UserId)
	if _, err := GetState(stub, key, &sellerUserTransactions); err != nil {
		return errors.Wrapf(err, "Get from userTransactions table error: %s", key)
	}
	sellerUserTransactions = append(sellerUserTransactions, transaction)
	if err := PutState(stub, key, &sellerUserTransactions); err != nil {
		return errors.Wrapf(err, "Add to userTransactions table error: %s", key)
	}

	buyerUserTransactions := []Transaction{}
	key = fmt.Sprintf("%s-%s", userTransactionsPrefix, buyerOrder.UserId)
	if _, err := GetState(stub, key, &buyerUserTransactions); err != nil {
		return errors.Wrapf(err, "Get from userTransactions table error: %s", key)
	}
	buyerUserTransactions = append(buyerUserTransactions, transaction)
	if err := PutState(stub, key, &buyerUserTransactions); err != nil {
		return errors.Wrapf(err, "Add to userTransactions table error: %s", key)
	}

	sellerOrderTransactions := []Transaction{}
	key = fmt.Sprintf("%s-%s", orderTransactionsPrefix, sellerOrder.UserId)
	if _, err := GetState(stub, key, &sellerOrderTransactions); err != nil {
		return errors.Wrapf(err, "Get from orderTransactions table error: %s", key)
	}
	sellerOrderTransactions = append(sellerOrderTransactions, transaction)
	if err := PutState(stub, key, &sellerOrderTransactions); err != nil {
		return errors.Wrapf(err, "Add to orderTransactions table error: %s", key)
	}

	buyerOrderTransactions := []Transaction{}
	key = fmt.Sprintf("%s-%s", orderTransactionsPrefix, sellerOrder.UserId)
	if _, err := GetState(stub, key, &buyerOrderTransactions); err != nil {
		return errors.Wrapf(err, "Get from orderTransactions table error: %s", key)
	}
	buyerOrderTransactions = append(buyerOrderTransactions, transaction)
	if err := PutState(stub, key, &buyerOrderTransactions); err != nil {
		return errors.Wrapf(err, "Add to orderTransactions table error: %s", key)
	}
	return nil
}

func updateOrder(stub shim.ChaincodeStubInterface, order *Order, isBuyer bool) error {
	key := fmt.Sprintf("%s-%s", orderPrefix, order.OrderId)
	if err := PutState(stub, key, order); err != nil {
		return errors.Wrapf(err, "Add to order table error: %s", key)
	}
	if order.RemainAmount == 0 {
		if isBuyer {
			key = fmt.Sprintf("%s-%s-%015d-%d", buyerOrderPrefix, order.EnergyType, order.Price, order.OrderId)
		} else {
			key = fmt.Sprintf("%s-%s-%015d-%d", sellerOrderPrefix, order.EnergyType, order.Price, order.OrderId)
		}
		if err := stub.DelState(key); err != nil {
			return errors.Wrapf(err, "Delete State error: %s", key)
		}
	}
	return nil
}
