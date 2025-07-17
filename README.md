# prisma-service

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.js
```

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## 專案概覽 (Project Overview)

這是一個使用 **Node.js**、**Express** 和 **TypeScript** 建立的 **Web API 服務**。它的核心目的是作為一個範例或測試平台，來完整展示 **Prisma ORM** 的各種資料庫操作功能。

### 技術棧 (Technology Stack)
*   **執行環境**: Node.js (搭配 Bun)
*   **Web 框架**: Express.js
*   **程式語言**: TypeScript
*   **資料庫 ORM**: Prisma
*   **資料庫**: SQLite

### 主要功能 (Main Functionality)
這個專案提供了一系列的 API 端點 (Endpoints)，用來操作 `User` (使用者) 和 `House` (房子) 這兩個資料模型。它不僅僅是簡單的增刪改查 (CRUD)，而是涵蓋了 Prisma 提供的多種進階功能，例如：

*   **基本操作**: 新增 (`create`)、查詢 (`findMany`, `findUnique`)、更新 (`update`)、刪除 (`delete`)。
*   **批次操作**: 一次建立多筆 (`createMany`) 或更新多筆 (`updateMany`) 資料。
*   **關聯操作**: 新增與使用者關聯的房子 (`add-house`)、查詢某個使用者的所有房子 (`user-houses/:id`)。
*   **聚合與分組**:
    *   計算使用者年齡的平均、總和、最大/最小值 (`aggregate-users`)。
    *   根據 `role` (角色) 進行分組並計數 (`group-by-role`)。
    *   查詢不重複的角色列表 (`distinct-roles`)。
*   **交易 (Transaction)**: 同時建立一個使用者和一棟房子，確保兩者都成功或都失敗 (`create-user-and-house`)。
*   **Upsert**: 如果使用者存在就更新，不存在就建立 (`upsert-user`)。

### 資料庫模型 (Database Models)
專案定義了兩個主要的資料模型：
1.  **`User`**: 包含 `id`, `name`, `email`, `phone`, `role`, `isActive`, `age` 等欄位。
2.  **`House`**: 包含 `id`, `address` 欄位，並且透過 `userId` 與 `User` 模型建立一對多關聯 (一個 User 可以擁有多個 House)。

### 如何使用 (How to Use)
*   `test.http` 檔案中包含了所有 API 的請求範例，您可以使用 VS Code 的 REST Client 擴充功能或其他工具來直接測試這些 API。
