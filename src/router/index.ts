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
  },
  auth: {
    adminMiddleware,
    requestLicense,
    checkLicenseKey,
  },
  util: {
    getTotalBottles,
  },
};
