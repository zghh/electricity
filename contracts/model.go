package main

const (
	userPrefix              string = "user"
	orderPrefix             string = "order"
	transactionPrefix       string = "transaction"
	userOrdersPrefix        string = "userOrders"
	userTransactionsPrefix  string = "userTransactions"
	orderTransactionsPrefix string = "orderTransactions"
	sellerOrderPrefix       string = "sellerOrder" // 用于匹配，当前还有余额的卖方订单
	buyerOrderPrefix        string = "buyerOrder"  // 用于匹配，当前还有余额的买方订单
)

const (
	MAX_PRICE int64 = 999999999999999
)

type User struct {
	Id       string `json:"id"`       // 用户ID
	Name     string `json:"name"`     // 用户名
	Type     int    `json:"type"`     // 用户类型，普通消费者为1，生产消费者为2，传统能源公司为3
	Password string `json:"password"` // 用户密码
}

type Order struct {
	OrderId      string `json:"orderId"`      // 订单ID
	Type         int    `json:"type"`         // 订单类型，卖方为1，买方为2
	UserId       string `json:"userId"`       // 用户ID
	EnergyType   string `json:"energyType"`   // 能源类型
	Price        int64  `json:"price"`        // 电价
	Amount       int64  `json:"amount"`       // 电量
	RemainAmount int64  `json:"remainAmount"` // 剩余电量
	Time         int64  `json:"time"`         // 订单发布时间
}

type Transaction struct {
	TransactionId string `json:"transactionId"` // 交易ID
	SellerOrderId string `json:"sellerOrderId"` // 卖方订单ID
	BuyerOrderId  string `json:"buyerOrderId"`  // 买方订单ID
	SellerId      string `json:"sellerId"`      // 卖方ID
	BuyerId       string `json:"buyerId"`       // 买方ID
	EnergyType    string `json:"energyType"`    // 能源类型
	Price         int64  `json:"price"`         // 电价
	Amount        int64  `json:"amount"`        // 电量
	Time          int64  `json:"time"`          // 交易时间
}

type QueryCurrentOrdersResponse struct {
	SellerOrders []Order `json:"sellerOrders"`
	BuyerOrders  []Order `json:"buyerOrders"`
}

type QueryOrderInfoResponse struct {
	OrderInfo    Order         `json:"orderInfo"`
	Transactions []Transaction `json:"transactions"`
}
