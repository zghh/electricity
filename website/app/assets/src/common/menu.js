import { isUrl } from "../utils/utils";

const menuData = [
  {
    name: "Order",
    path: "order",
    icon: "code-o",
    children: [
      {
        name: "Current orders",
        path: "current",
      },
      {
        name: "My orders",
        path: "my",
      },
      {
        name: "New Order",
        path: "new/:type",
        hideInMenu: true,
        hideInBreadcrumb: false,
      },
      {
        name: "Order Detail",
        path: "detail/:id",
        hideInMenu: true,
        hideInBreadcrumb: false,
      },
    ],
  },
  {
    name: "Transaction",
    path: "transaction",
    icon: "link",
    children: [
      {
        name: "List",
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
