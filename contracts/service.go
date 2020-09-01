package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/pkg/errors"
)

/**
 * args[0] user
 */
func register(stub shim.ChaincodeStubInterface, args []string) error {
	user := User{}
	if err := json.Unmarshal([]byte(args[0]), &user); err != nil {
		return errors.Wrapf(err, "Unmarshal error: %s", args[0])
	}

	key := fmt.Sprintf("%s-%s", userPrefix, user.Id)
	value, err := stub.GetState(key)
	if err != nil {
		return errors.Wrapf(err, "GetState error, user id: %s", key)
	}
	if value != nil {
		return fmt.Errorf("User has already exists: %s", key)
	}
	if err := PutState(stub, key, &user); err != nil {
		return errors.Wrapf(err, "Add to user table error: %s", key)
	}
	return nil
}

/**
 * args[0] user
 */
func login(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	user := User{}
	if err := json.Unmarshal([]byte(args[0]), &user); err != nil {
		return "", errors.Wrapf(err, "Unmarshal error: %s", args[0])
	}

	key := fmt.Sprintf("%s-%s", userPrefix, user.Id)
	userInState := User{}
	isNil, err := GetState(stub, key, &userInState)
	if err != nil {
		return "", errors.Wrapf(err, "Get from user table error: %s", key)
	}
	if isNil || user.Password != userInState.Password {
		return "false", nil
	}
	return "true", nil
}

/**
 * args[0] order
 */
func submitSellerOrder(stub shim.ChaincodeStubInterface, args []string) error {
	order := Order{}
	if err := json.Unmarshal([]byte(args[0]), &order); err != nil {
		return errors.Wrapf(err, "Unmarshal error: %s", args[0])
	}

	txid := stub.GetTxID()
	order.OrderId = txid
	order.RemainAmount = order.Amount
	if err := findBuyerOrders(stub, &order); err != nil {
		return errors.Wrapf(err, "Find buyer orders error")
	}

	userOrders := []string{}
	key := fmt.Sprintf("%s-%s", userOrdersPrefix, order.UserId)
	if _, err := GetState(stub, key, &userOrders); err != nil {
		return errors.Wrapf(err, "Get from userOrders table error: %s", key)
	}
	userOrders = append(userOrders, order.OrderId)
	if err := PutState(stub, key, &userOrders); err != nil {
		return errors.Wrapf(err, "Put to userOrders table error: %s", key)
	}

	key = fmt.Sprintf("%s-%s-%015d-%s", sellerOrderPrefix, order.EnergyType, order.Price, order.OrderId)
	if err := stub.PutState(key, []byte(order.OrderId)); err != nil {
		return errors.Wrapf(err, "Put to sellerOrder table error: %s", key)
	}
	return nil
}

/**
 * args[0] order
 */
func submitBuyerOrder(stub shim.ChaincodeStubInterface, args []string) error {
	order := Order{}
	if err := json.Unmarshal([]byte(args[0]), &order); err != nil {
		return errors.Wrapf(err, "Unmarshal error: %s", args[0])
	}

	txid := stub.GetTxID()
	order.OrderId = txid
	order.RemainAmount = order.Amount
	if err := findSellerOrders(stub, &order); err != nil {
		return errors.Wrapf(err, "Find buyer orders error")
	}

	userOrders := []string{}
	key := fmt.Sprintf("%s-%s", userOrdersPrefix, order.UserId)
	if _, err := GetState(stub, key, &userOrders); err != nil {
		return errors.Wrapf(err, "Get from userOrders table error: %s", key)
	}
	userOrders = append(userOrders, order.OrderId)
	if err := PutState(stub, key, &userOrders); err != nil {
		return errors.Wrapf(err, "Put to userOrders table error: %s", key)
	}

	key = fmt.Sprintf("%s-%s-%015d-%s", buyerOrderPrefix, order.EnergyType, order.Price, order.OrderId)
	if err := stub.PutState(key, []byte(order.OrderId)); err != nil {
		return errors.Wrapf(err, "Put to buyerOrder table error: %s", key)
	}
	return nil
}

/**
 * args[0] userId
 */
func queryOrders(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	userId := args[0]
	result := []Order{}

	key := fmt.Sprintf("%s-%s", userOrdersPrefix, userId)
	userOrders := []string{}
	isNil, err := GetState(stub, key, &userOrders)
	if err != nil {
		return "", errors.Wrapf(err, "Get from userOrders table error: %s", key)
	}
	if !isNil {
		for _, orderId := range userOrders {
			order := Order{}
			key = fmt.Sprintf("%s-%s", orderPrefix, orderId)
			if _, err = GetState(stub, key, &order); err != nil {
				return "", errors.Wrapf(err, "Get from order table error: %s", key)
			}
			result = append(result, order)
		}
	}
	jsonBytes, err := json.Marshal(&result)
	if err != nil {
		return "", errors.Wrapf(err, "Marshal error: %s", result)
	}
	return string(jsonBytes), nil
}

/**
 * args[0] userId
 */
func queryTransactions(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	userId := args[0]

	key := fmt.Sprintf("%s-%s", userTransactionsPrefix, userId)
	result, err := stub.GetState(key)
	if err != nil {
		return "", errors.Wrapf(err, "Get from userTransactions table error: %s", key)
	}
	if result == nil {
		return "[]", nil
	}
	return string(result), nil
}
