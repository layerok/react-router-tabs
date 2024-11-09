import { HomeRoute } from "src/examples/basic/routes/HomeRoute.tsx";
import {
  ProductDetailRoute,
  ProductListRoute,
  ProductsRoute,
} from "src/examples/basic/routes/ProductsRoute.tsx";
import { TabStoreKey } from "src/examples/basic/constants/tabs.constants.ts";
import {
  CategoriesRoute,
  CategoryDetailRoute,
  CategoryListRoute,
} from "src/examples/basic/routes/CategoriesRoute.tsx";
import { SuppliersRoute } from "src/examples/basic/routes/SuppliersRoute.tsx";
import { AdminLayout } from "src/examples/basic/components/AdminLayout/AdminLayout.tsx";
import {
  homeRoute,
  categoriesRoute,
  categoryDetailRoute,
  productDetailRoute,
  productsRoute,
  suppliersRoute,
} from "src/examples/basic/constants/routes.constants.ts";
import { Handle } from "src/examples/basic/types.ts";

const productRoutes = [
  {
    path: productsRoute,
    element: <ProductsRoute />,
    handle: {
      tabs: [
        {
          key: TabStoreKey.Main,
          title: () => "products",
        },
      ],
    } as Handle,
    children: [
      {
        index: true,
        element: <ProductListRoute />,
        handle: {
          tabs: [
            {
              key: TabStoreKey.Products,
              title: () => "All products",
            },
          ],
        } as Handle,
      },
      {
        path: productDetailRoute,
        element: <ProductDetailRoute />,
        handle: {
          tabs: [
            {
              key: TabStoreKey.Products,
              title: (match) => `product ${match.params.id}`,
              insertAt: () => 1,
            },
          ],
        } as Handle,
      },
    ],
  },
];

const categoryRoutes = [
  {
    path: categoriesRoute,
    element: <CategoriesRoute />,
    handle: {
      tabs: [
        {
          key: TabStoreKey.Main,
          title: () => "categories",
        },
      ],
    } as Handle,
    children: [
      {
        index: true,
        element: <CategoryListRoute />,
        handle: {
          tabs: [
            {
              key: TabStoreKey.Categories,
              title: () => "All categories",
            },
          ],
        } as Handle,
      },
      {
        path: categoryDetailRoute,
        element: <CategoryDetailRoute />,
        handle: {
          tabs: [
            {
              key: TabStoreKey.Categories,
              title: (match) => `category ${match.params.id}`,
              insertAt: () => 1,
            },
          ],
        } as Handle,
      },
    ],
  },
];

const supplierRoutes = [
  {
    path: suppliersRoute,
    element: <SuppliersRoute />,
    handle: {
      tabs: [
        {
          key: TabStoreKey.Main,
          title: () => "suppliers",
        },
      ],
    } as Handle,
  },
];

export const basicExampleRoutes = [
  {
    path: homeRoute,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      ...productRoutes,
      ...categoryRoutes,
      ...supplierRoutes,
    ],
  },
];
