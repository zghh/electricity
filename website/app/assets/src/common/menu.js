import { isUrl } from "../utils/utils";

const menuData = [
  {
    name: "order",
    path: "order",
    icon: "code-o",
    children: [
      {
        name: "order-currentOrders",
        path: "current",
      },
      {
        name: "order-myOrders",
        path: "my",
      },
      {
        name: "order-newOrder",
        path: "new/:type",
        hideInMenu: true,
        hideInBreadcrumb: false,
      },
      {
        name: "order-detail",
        path: "detail/:id",
        hideInMenu: true,
        hideInBreadcrumb: false,
      },
    ],
  },
  {
    name: "transaction",
    path: "transaction",
    icon: "link",
    children: [
      {
        name: "transaction-list",
        path: "index",
      },
    ],
  },
];

function formatter(data, parentPath = "/", parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(
        item.children,
        `${parentPath}${item.path}/`,
        item.authority
      );
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
