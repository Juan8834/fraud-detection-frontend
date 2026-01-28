import express from "express";
import employeesRouter from "./routes/employees";
import itemsRouter from "./routes/items";
import transactionsRouter from "./routes/transactions";

const app = express();
const PORT = 5000;

app.use(express.json());

app.use("/employees", employeesRouter);
app.use("/items", itemsRouter);
app.use("/transactions", transactionsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
