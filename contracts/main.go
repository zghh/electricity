package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type Electricity struct {
}

func (t *Electricity) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (t *Electricity) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if len(args) != 1 {
		return shim.Error("Incorrect arguments")
	}
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
	case "queryOrders":
		result, err = queryOrders(stub, args)
	case "queryTransactions":
		result, err = queryTransactions(stub, args)
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
