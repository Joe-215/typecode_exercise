import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import filter from 'lodash/fp/filter'
import orderBy from 'lodash/fp/orderBy'

import { selectTaskById } from '../tasks/selectors'

const DOMAIN_NAME = 'columns'

const selectDomainState = state => state[DOMAIN_NAME]

const selectColumnByIdMap = createSelector(
  selectDomainState,
  domainState => domainState.byId
)

export const selectColumnById = createCachedSelector(
  selectColumnByIdMap,
  (state, columnId) => columnId,
  (columnsById, columnId) => columnsById[columnId]
)((state, columnId) => columnId)

export const selectTasksOfColumn = createCachedSelector(
  state => state,
  selectColumnById,
  (state, column) => {
    if (!column) {
      return []
    }

    return flow(
      map(taskId => selectTaskById(state, taskId)),
      filter(task => !!task),
      orderBy(['position'], ['asc'])
    )(column.tasks)
  }
)((state, columnId) => columnId)

export const selectNestedColumnById = createCachedSelector(
  selectColumnById,
  selectTasksOfColumn,
  (column, tasks) => {
    if (!column) {
      return undefined
    }

    return {
      ...column,
      tasks,
    }
  }
)((state, columnId) => columnId)

export const selectTaskPositionsOfColumn = createCachedSelector(
  selectTasksOfColumn,
  tasks =>
    tasks.map(task => ({
      id: task.id,
      position: task.position,
      title: `${task.position}. ${task.title} (${task.name})`,
    }))
)((state, columnId) => columnId)
