import { type Request } from 'express'

export default interface Context {
  req?: Request
  reqId: string
//   dataSources: {
//     dsMysql: MysqlDataSource
//   }
}
