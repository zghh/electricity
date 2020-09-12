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
		return false, errors.Wrapf(err, "GetState error, key: %s", key)
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

func GetLatestState(stub shim.ChaincodeStubInterface, key string, object interface{}, m map[string]([]byte)) (bool, error) {
	var value []byte
	var err error
	if m[key] != nil {
		value = m[key]
	} else {
		value, err = stub.GetState(key)
		if err != nil {
			return false, errors.Wrapf(err, "GetState error, key: %s", key)
		}
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

func PutLatestState(stub shim.ChaincodeStubInterface, key string, value interface{}, m map[string]([]byte)) error {
	jsonBytes, err := json.Marshal(&value)
	if err != nil {
		return errors.Wrapf(err, "Marshal error: %s", value)
	}
	err = stub.PutState(key, jsonBytes)
	if err != nil {
		return errors.Wrapf(err, "PutState error: %s, %s", key, string(jsonBytes))
	}
	m[key] = jsonBytes
	return nil
}
