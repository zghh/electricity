package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type Electricity struct {
}

func (t *Electricity) Init(stub shim.ChaincodeStubInterface) pb.Response {
	err := initChaincode(stub)
	if err != nil {
		return shim.Error(err.Error())
	} else {
		return shim.Success(nil)
	}
}

func (t *Electricity) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	var result string
	var err error
	switch function {
	case "register":
		err = register(stub, args)
	case "login":
		result, err = login(stub, args)
	case "submitSellerOrder":
		err = submitSellerOrder(stub, args)
	case "submitBuyerOrder":
		err = submitBuyerOrder(stub, args)
	case "queryCurrentOrders":
		result, err = queryCurrentOrders(stub, args)
	case "queryMyOrders":
		result, err = queryMyOrders(stub, args)
	case "queryOrderInfo":
		result, err = queryOrderInfo(stub, args)
	case "queryTransactions":
		result, err = queryTransactions(stub, args)
	case "queryUsers":
		result, err = queryUsers(stub, args)
	default:
		err = fmt.Errorf("Invalid function name: %s", function)
	}
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(result))
}

func main() {
	err := shim.Start(new(Electricity))
	if err != nil {
		fmt.Printf("Error starting chaincode: %s", err)
	}
}
