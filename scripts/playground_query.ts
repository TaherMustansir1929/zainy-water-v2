import { db } from "@/db";
import { Customer } from "@/db/schema";

const deposit = await db.select({ deposit: Customer.deposit }).from(Customer);
const deposit_count = deposit.map((d) => d.deposit).reduce((a, b) => a + b, 0);
console.log("Total Deposit Bottles: ", deposit_count);
