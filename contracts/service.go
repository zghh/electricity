package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/pkg/errors"
)

func initChaincode(stub shim.ChaincodeStubInterface) error {
	user := User{
		Id:       "admin",
		Name:     "admin",
		Type:     0,
		Password: "1a1dc91c907325c69271ddf0c944bc72",
	}

	key := fmt.Sprintf("%s-%s", userPrefix, user.Id)
	if err := PutState(stub, key, &user); err != nil {
		return errors.Wrapf(err, "Add to user table error: %s", key)
	}
	return nil
}

/**
 * args[0] user
 */
func register(stub shim.ChaincodeStubInterface, args []string) error {
	if len(args) != 1 {
		return fmt.Errorf("Incorrect arguments")
	}

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
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments")
	}

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
		return "", fmt.Errorf("Invalid")
	}
	jsonBytes, err := json.Marshal(&userInState)
	if err != nil {
		return "", errors.Wrapf(err, "Marshal error: %s", userInState)
	}
	return string(jsonBytes), nil
}

/**
 * args[0] order
 */
func submitSellerOrder(stub shim.ChaincodeStubInterface, args []string) error {
	if len(args) != 1 {
		return fmt.Errorf("Incorrect arguments")
	}

	timestamp, err := stub.GetTxTimestamp()
	if err != nil {
		return errors.Wrapf(err, "GetTxTimestamp error")
	}
	order := Order{}
	if err := json.Unmarshal([]byte(args[0]), &order); err != nil {
		return errors.Wrapf(err, "Unmarshal error: %s", args[0])
	}

	txid := stub.GetTxID()
	order.OrderId = txid
	order.RemainAmount = order.Amount
	order.Time = timestamp.Seconds
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

	if order.RemainAmount != 0 {
		key = fmt.Sprintf("%s-%s-%015d-%s", sellerOrderPrefix, order.EnergyType, order.Price, order.OrderId)
		if err := stub.PutState(key, []byte(order.OrderId)); err != nil {
			return errors.Wrapf(err, "Put to sellerOrder table error: %s", key)
		}
	}
	return nil
}

/**
 * args[0] order
 */
func submitBuyerOrder(stub shim.ChaincodeStubInterface, args []string) error {
	if len(args) != 1 {
		return fmt.Errorf("Incorrect arguments")
	}

	timestamp, err := stub.GetTxTimestamp()
	if err != nil {
		return errors.Wrapf(err, "GetTxTimestamp error")
	}
	order := Order{}
	if err := json.Unmarshal([]byte(args[0]), &order); err != nil {
		return errors.Wrapf(err, "Unmarshal error: %s", args[0])
	}

	txid := stub.GetTxID()
	order.OrderId = txid
	order.RemainAmount = order.Amount
	order.Time = timestamp.Seconds
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

	if order.RemainAmount != 0 {
		key = fmt.Sprintf("%s-%s-%015d-%s", buyerOrderPrefix, order.EnergyType, order.Price, order.OrderId)
		if err := stub.PutState(key, []byte(order.OrderId)); err != nil {
			return errors.Wrapf(err, "Put to buyerOrder table error: %s", key)
		}
	}
	return nil
}

func queryCurrentOrders(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 0 {
		return "", fmt.Errorf("Incorrect arguments")
	}

	buyerOrders := []Order{}
	err := getCurrentOrders(stub, true, &buyerOrders)
	if err != nil {
		return "", errors.Wrapf(err, "Get buyer orders error")
	}

	sellerOrders := []Order{}
	err = getCurrentOrders(stub, false, &sellerOrders)
	if err != nil {
		return "", errors.Wrapf(err, "Get buyer orders error")
	}

	result := QueryCurrentOrdersResponse{
		BuyerOrders:  buyerOrders,
		SellerOrders: sellerOrders,
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
func queryMyOrders(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments")
	}

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

func queryALLOrders(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 0 {
		return "", fmt.Errorf("Incorrect arguments")
	}

	orders := []Order{}

	startKey := fmt.Sprintf("%s-", orderPrefix)
	endKey := fmt.Sprintf("%s-~", orderPrefix)
	iterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return "", errors.Wrapf(err, "GetStateByRange error")
	}
	for iterator.HasNext() {
		result, err := iterator.Next()
		if err != nil {
			return "", errors.Wrapf(err, "Iterator error")
		}
		order := Order{}
		if err := json.Unmarshal(result.Value, &order); err != nil {
			return "", errors.Wrapf(err, "Unmarshal error: %s", string(result.Value))
		}
		orders = append(orders, order)
	}
	err = iterator.Close()
	if err != nil {
		return "", errors.Wrapf(err, "Iterator error")
	}

	jsonBytes, err := json.Marshal(&orders)
	if err != nil {
		return "", errors.Wrapf(err, "Marshal error: %s", orders)
	}
	return string(jsonBytes), nil
}

/**
 * args[0] orderId
 */
func queryOrderInfo(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments")
	}

	orderId := args[0]
	key := fmt.Sprintf("%s-%s", orderPrefix, orderId)
	orderInfo := Order{}
	isNil, err := GetState(stub, key, &orderInfo)
	if err != nil {
		return "", errors.Wrapf(err, "Get from order table error: %s", key)
	}
	if isNil {
		return "", fmt.Errorf("Order is not exists: %s", orderId)
	}

	transactions := []Transaction{}
	key = fmt.Sprintf("%s-%s", orderTransactionsPrefix, orderId)
	if _, err = GetState(stub, key, &transactions); err != nil {
		return "", errors.Wrapf(err, "Get from orderTransactions table error: %s", key)
	}

	result := QueryOrderInfoResponse{
		OrderInfo:    orderInfo,
		Transactions: transactions,
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
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments")
	}

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

func queryALLTransactions(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 0 {
		return "", fmt.Errorf("Incorrect arguments")
	}

	transactions := []Transaction{}

	startKey := fmt.Sprintf("%s-", transactionPrefix)
	endKey := fmt.Sprintf("%s-~", transactionPrefix)
	iterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return "", errors.Wrapf(err, "GetStateByRange error")
	}
	for iterator.HasNext() {
		result, err := iterator.Next()
		if err != nil {
			return "", errors.Wrapf(err, "Iterator error")
		}
		transaction := Transaction{}
		if err := json.Unmarshal(result.Value, &transaction); err != nil {
			return "", errors.Wrapf(err, "Unmarshal error: %s", string(result.Value))
		}
		transactions = append(transactions, transaction)
	}
	err = iterator.Close()
	if err != nil {
		return "", errors.Wrapf(err, "Iterator error")
	}

	jsonBytes, err := json.Marshal(&transactions)
	if err != nil {
		return "", errors.Wrapf(err, "Marshal error: %s", transactions)
	}
	return string(jsonBytes), nil
}

func getCurrentOrders(stub shim.ChaincodeStubInterface, isBuyer bool, orders *[]Order) error {
	var perfix string
	if isBuyer {
		perfix = buyerOrderPrefix
	} else {
		perfix = sellerOrderPrefix
	}
	startKey := fmt.Sprintf("%s", perfix)
	endKey := fmt.Sprintf("%s~", perfix)
	iterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return errors.Wrapf(err, "GetStateByRange error")
	}
	for iterator.HasNext() {
		result, err := iterator.Next()
		if err != nil {
			return errors.Wrapf(err, "Iterator error")
		}
		order := Order{}
		key := fmt.Sprintf("%s-%s", orderPrefix, string(result.Value))
		if _, err := GetState(stub, key, &order); err != nil {
			return errors.Wrapf(err, "Get order error: %s", string(result.Value))
		}
		*orders = append(*orders, order)
	}
	err = iterator.Close()
	if err != nil {
		return errors.Wrapf(err, "Iterator error")
	}
	return nil
}

func queryUsers(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 0 {
		return "", fmt.Errorf("Incorrect arguments")
	}

	users := []User{}
	startKey := fmt.Sprintf("%s-", userPrefix)
	endKey := fmt.Sprintf("%s-~", userPrefix)
	iterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return "", errors.Wrapf(err, "GetStateByRange error")
	}
	defer iterator.Close()
	for iterator.HasNext() {
		result, err := iterator.Next()
		if err != nil {
			return "", errors.Wrapf(err, "Iterator error")
		}
		user := User{}
		if err := json.Unmarshal(result.Value, &user); err != nil {
			return "", errors.Wrapf(err, "Unmarshal error")
		}
		if user.Id != "admin" {
			users = append(users, user)
		}
	}

	jsonBytes, err := json.Marshal(&users)
	if err != nil {
		return "", errors.Wrapf(err, "Marshal error: %s", users)
	}
	return string(jsonBytes), nil
}
