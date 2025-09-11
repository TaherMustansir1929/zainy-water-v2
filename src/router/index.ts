import {
  addDailyDelivery,
  getCustomersByArea,
  getDailyDeliveries,
} from "@/modules/moderator/daily-deliveries/server/add-daily-delivery.orpc";
import { deleteDailyDelivery } from "@/modules/moderator/daily-deliveries/server/delete-daily-delivery.orpc";
import {
  addOtherExpense,
  getOtherExpensesByModeratorId,
} from "@/modules/moderator/other-expenses/server/add-other-expense";
import { addUpdateBottleUsage } from "@/modules/moderator/bottle-usage/server/add-update-bottle-usage.orpc";
import { getBottleUsage } from "@/modules/moderator/bottle-usage/server/getBottleUsage.orpc";
import { returnBottleUsage } from "@/modules/moderator/bottle-usage/server/return-bottle-usage.orpc";
import { addMiscDelivery } from "@/modules/moderator/miscellaneous-deliveries/server/addMiscDelivery.orpc";
import { addMiscBottleUsage } from "@/modules/moderator/miscellaneous-deliveries/server/addMiscBottleUsage.orpc";
import { getMiscDeliveriesByMod } from "@/modules/moderator/miscellaneous-deliveries/server/getMiscDeliveriesByMod.orpc";
import { getTotalBottles } from "@/modules/util/server/get-total-bottles.orpc";
import {
  modLogin,
  modLoginStatus,
  modLogout,
  modMiddleware,
} from "@/modules/moderator/login/server/mod-login.orpc";
import { adminMiddleware } from "@/modules/auth/admin-middleware/server/adminMiddleware.orpc";
import {
  checkLicenseKey,
  requestLicense,
} from "@/modules/auth/license-key/server/licenseKey.orpc";
import { updateTotalBottles } from "@/modules/admin/bottle-inventory/server/updateTotalBottles.orpc";
import { dashboardAnalyticsOrpc } from "@/modules/admin/main/server/dashboardAnalytics.orpc";
import { updateOtherExpense } from "@/modules/admin/other-expenses/server/updateOtherExpense.orpc";
import {
  createModerator,
  deleteModerator,
  getModList,
  updateModerator,
  updateModStatus,
} from "@/modules/admin/add-moderator/server/crudModerator.orpc";
import { updateMiscDelivery } from "@/modules/admin/deliveries/server/updateMiscDelivery.orpc";
import { updateDailyDelivery } from "@/modules/admin/deliveries/server/updateDailyDelivey.orpc";
import { createCustomer } from "@/modules/admin/customer-information/server/createCustomer.orpc";
import { deleteCustomer } from "@/modules/admin/customer-information/server/deleteCustomer.orpc";
import { updateCustomer } from "@/modules/admin/customer-information/server/updateCustomer.orpc";
import { getAllCustomers } from "@/modules/admin/customer-information/server/getAllCustomers.orpc";
import { get30dBottleUsage } from "@/modules/util/server/get30dBottleUsage.orpc";
import { get30dDeliveries } from "@/modules/util/server/get30dDeliveries.orpc";
import { get30dMiscDeliveries } from "@/modules/util/server/get30dMiscDeliveries.orpc";
import { get30dOtherExpenses } from "@/modules/util/server/get30dOtherExpenses.orpc";

export const router = {
  moderator: {
    deliveries: {
      addDailyDelivery,
      getDailyDeliveries,
      getCustomersByArea,
      deleteDailyDelivery,
    },
    otherExpenses: {
      addOtherExpense,
      getOtherExpensesByModeratorId,
    },
    bottleUsage: {
      addUpdateBottleUsage,
      getBottleUsage,
      returnBottleUsage,
    },
    miscellaneous: {
      addMiscDelivery,
      addMiscBottleUsage,
      getMiscDeliveriesByMod,
    },
    auth: {
      modMiddleware,
      modLogin,
      modLoginStatus,
      modLogout,
    },
  },
  admin: {
    bottleInventory: {
      updateTotalBottles,
    },
    main: {
      dashboardAnalytics: dashboardAnalyticsOrpc,
    },
    otherExpenses: {
      updateOtherExpense,
    },
    crudModerator: {
      getModList,
      createModerator,
      deleteModerator,
      updateModerator,
      updateModStatus,
    },
    deliveries: {
      updateDailyDelivery,
      updateMiscDelivery,
    },
    customerInfo: {
      createCustomer,
      deleteCustomer,
      updateCustomer,
      getAllCustomers,
    },
  },
  auth: {
    adminMiddleware,
    requestLicense,
    checkLicenseKey,
  },
  util: {
    getTotalBottles,
    get30dBottleUsage,
    get30dDeliveries,
    get30dMiscDeliveries,
    get30dOtherExpenses,
  },
};
