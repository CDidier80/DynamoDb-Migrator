const AWS = require("aws-sdk")
const BatchTransactor = require("../utils/BatchTransactor")

class DbClient {
  constructor(tableName, options) {
    this.tableName = tableName
    this.db = new AWS.DynamoDB.DocumentClient(options)
  }

  async getItem({ pk, sk }) {
    if (!pk || !sk) {
      throw new Error("PK and SK required to getItem")
    }

    const { Item } = await this.db
      .get({
        TableName: this.tableName,
        Key: { pk, sk },
      })
      .promise()

    return Item
  }

  async getItems(params) {
    const { Items } = await this.db
      .query({
        TableName: this.tableName,
        ...params,
      })
      .promise()

    return Items
  }

  async put(item, params = {}) {
    const _params = {
      TableName: this.tableName,
      Item: item,
      ...params,
    }
    await this.db
      .put(_params, (err, data) => {
        if (err) {
          console.error(err)
          throw new Error("Failed to put item")
        }
      })
      .promise()
  }

  async delete(item) {
    await this.db
      .delete(
        {
          TableName: this.tableName,
          Key: {
            pk: item.pk,
            sk: item.sk,
          },
        },
        (err, data) => {
          if (err) {
            console.error(err)
            throw new Error("Failed to delete item")
          }
        }
      )
      .promise()
  }

  async batchDelete(Items) {
    if (!Items.length) {
      console.log("No items to delete.")
      return
    }

    const batchTransactor = new BatchTransactor(Items)

    await batchTransactor.forEachBatch(async (items) => {
      await this.db
        .transactWrite(
          {
            TransactItems: items.map(({ pk, sk }) => {
              return {
                Delete: {
                  TableName: this.tableName,
                  Key: {
                    sk,
                    pk,
                  },
                },
              }
            }),
          },
          (err, data) => {
            if (err) {
              console.error(err)
            }
          }
        )
        .promise()
    })
  }

  async batchPut(Items) {
    if (!Items.length) {
      console.log("No items to create.")
      return
    }

    const batchTransactor = new BatchTransactor(Items)

    await batchTransactor.forEachBatch(async (items) => {
      await this.db
        .transactWrite(
          {
            TransactItems: items.map((item) => {
              return {
                Put: {
                  TableName: this.tableName,
                  Item: item,
                },
              }
            }),
          },
          (err, data) => {
            if (err) {
              console.error(err)
              throw new Error("Failed to save items.")
            }
          }
        )
        .promise()
    })
  }

  /** Get a collection of items by partition key */
  async getItemCollection(pk) {
    return await this.db
      .query({
        TableName: this.tableName,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": pk },
      })
      .promise()
  }

  async query(params) {
    const result = await this.db.query(params).promise()
    return result
  }

  async scan(params) {
    const response = await this.db
      .scan({
        TableName: this.tableName,
        ...params,
      })
      .promise()
    return response.Items
  }

  // todo: consider moving the below 3 methods to another class

  async getMigrationHistory() {
    const Item = await this.getItem({
      pk: "MIGRATIONS",
      sk: "MIGRATIONS",
    })
    return Item?.migrations
  }

  async createMigrationHistory() {
    await this.put({
      pk: "MIGRATIONS",
      sk: "MIGRATIONS",
      itemType: "MIGRATIONS",
      migrations: [],
    })
  }

  async updateMigrationHistory(migrations) {
    if (!migrations) {
      throw new Error(
        "Must provide an array of completed migration times as an argument to method 'updateMigrationHistory'."
      )
    }
    await this.put({
      pk: "MIGRATIONS",
      sk: "MIGRATIONS",
      itemType: "MIGRATIONS",
      migrations,
    })
  }
}

module.exports = DbClient
