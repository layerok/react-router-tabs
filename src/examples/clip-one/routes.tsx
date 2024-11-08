import { HomeRoute } from "./routes/HomeRoute.tsx";
import {
  ProductCreateRoute,
  ProductDetailRoute,
  ProductGeneralTab,
  ProductListRoute,
  ProductSettingsTab,
  ProductsRoute,
} from "./routes/ProductsRoute.tsx";
import {
  CategoriesRoute,
  CategoryDetailRoute,
  CategoryListRoute,
} from "./routes/CategoriesRoute.tsx";
import { SuppliersRoute } from "./routes/SuppliersRoute.tsx";
import { AdminLayout } from "src/examples/clip-one/components/AdminLayout/AdminLayout.tsx";
import {
  homeRoute,
  categoriesRoute,
  categoryDetailRoute,
  productDetailRoute,
  productsRoute,
  suppliersRoute,
  dashboardRoute,
  productDetailSettingTabsRoute,
  productsCreateRoute,
} from "./constants/routes.constants.ts";
import { DashboardRoute } from "src/examples/clip-one/routes/DashboardRoute.tsx";

const productRoutes = [
  {
    path: productsRoute,
    element: <ProductsRoute />,
    children: [
      {
        index: true,
        element: <ProductListRoute />,
      },
      {
        path: productsCreateRoute,
        element: <ProductCreateRoute />,
      },
      {
        path: productDetailRoute,
        element: <ProductDetailRoute />,
        children: [
          {
            index: true,
            element: <ProductGeneralTab />,
          },
          {
            path: productDetailSettingTabsRoute,
            element: <ProductSettingsTab />,
          },
        ],
      },
    ],
  },
];

const categoryRoutes = [
  {
    path: categoriesRoute,
    element: <CategoriesRoute />,
    children: [
      {
        index: true,
        element: <CategoryListRoute />,
      },
      {
        path: categoryDetailRoute,
        element: <CategoryDetailRoute />,
      },
    ],
  },
];

const supplierRoutes = [
  {
    path: suppliersRoute,
    element: <SuppliersRoute />,
  },
];

const dashboard = {
  path: dashboardRoute,
  element: <DashboardRoute />,
};

export const clipOneRoutes = [
  {
    path: homeRoute,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      dashboard,
      ...productRoutes,
      ...categoryRoutes,
      ...supplierRoutes,
    ],
  },
];
