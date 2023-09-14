import _ from 'lodash'
import { type Repository, type BaseEntity, LessThan, MoreThan, type FindOptionsWhere } from 'typeorm'
import { type ValuesType } from 'utility-types'

export const typeDefs = `#graphql
    type PageInfo {
        """
        When paginating forwards, the cursor to continue.
        """
        endCursor: ID
        """
        When paginating forwards, are there more items?
        """
        hasNextPage: Boolean!
    }
`

export class PageInfo {
  endCursor: number = 0
  hasNextPage: boolean = false
}

export class PageEdge<T> {
  cursor: number
  node: T
}

export class PageConnection<T> {
  edges: Array<PageEdge<T>> = []
  pageInfo: PageInfo = new PageInfo()
  totalCount: number = 0
}

export const setEdges = <T extends BaseEntity>(data: T[], key: keyof T): Array<PageEdge<T>> => {
  return _.map(data, (v, k) => {
    let cursor: any = data[k]?.[key]
    if (cursor instanceof Date) cursor = cursor.getTime()
    if (!_.isNumber(cursor)) throw new Error('cursor is not finite')
    return {
      cursor,
      node: v,
    }
  })
}

export const setConnection = <T extends BaseEntity >(data: T[], key: keyof T, size: number, total: number): PageConnection<T> => {
  if (data.length === 0) {
    return new PageConnection<T>()
  }

  const edges = setEdges(data, key)
  const hasNextPage = edges.length > size
  if (hasNextPage) {
    edges.pop()
  }

  return {
    edges,
    pageInfo: {
      endCursor: edges[edges.length - 1].cursor,
      hasNextPage,
    },
    totalCount: total,
  }
}

interface IPaginationQueryInfo<T extends BaseEntity > {
  size: number
  cursorOrder: { key: keyof T, value?: ValuesType<T>, order: 'ASC' | 'DESC' }
  where?: FindOptionsWhere<T>
  repo: Repository<T>
  withDeleted?: boolean
}
export const getPagination = async <T extends BaseEntity >(pageInfo: IPaginationQueryInfo<T>): Promise<PageConnection<T>> => {
  const size = pageInfo.size + 1
  const query = pageInfo.repo.createQueryBuilder()

  if (!_.isNil(pageInfo.where)) {
    query.where(pageInfo.where)
  }

  if (_.isBoolean(pageInfo.withDeleted)) {
    query.withDeleted()
  }

  const total = await query.getCount()

  if (!_.isNil(pageInfo.cursorOrder.value)) {
    const value: ValuesType<T> = pageInfo.cursorOrder.value
    if (pageInfo.cursorOrder.order === 'ASC') {
      query.andWhere({ [pageInfo.cursorOrder.key]: MoreThan(value) })
    } else {
      // order by DESC
      query.andWhere({ [pageInfo.cursorOrder.key]: LessThan(value) })
    }
  }
  query.orderBy({ [pageInfo.cursorOrder.key]: pageInfo.cursorOrder.order })
  const data = await query.limit(size).getMany()

  return setConnection<T>(data, pageInfo.cursorOrder.key, pageInfo.size, total)
}
