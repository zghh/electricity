package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/pkg/errors"
)

func PutState(stub shim.ChaincodeStubInterface, key string, value interface{}) error {
	jsonBytes, err := json.Marshal(&value)
	if err != nil {
		return errors.Wrapf(err, "Marshal error: %s", value)
	}
	err = stub.PutState(key, jsonBytes)
	if err != nil {
		return errors.Wrapf(err, "PutState error: %s, %s", key, string(jsonBytes))
	}
	return nil
}

func GetState(stub shim.ChaincodeStubInterface, key string, object interface{}) (bool, error) {
	value, err := stub.GetState(key)
	if err != nil {
		return false, errors.Wrapf(err, "GetState error, user id: %s", key)
	}
	if value != nil {
		err = json.Unmarshal(value, object)
		if err != nil {
			return false, errors.Wrapf(err, "Unmarshal error: %s", string(value))
		}
		return false, nil
	} else {
		return true, nil
	}
}
