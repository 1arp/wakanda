import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import store from '../store/index';
import client from '../services/api';

const submissionToReviewStatus = (userTaskId) => {
  return client.post(`/submission/${userTaskId}/status`, {
    status: 'review',
  });
};

const activeTasksAdapter = createEntityAdapter();

const activeTasksInitialState = activeTasksAdapter.getInitialState({
  status: 'idle',
  error: null,
});

export const activeTasksSlice = createSlice({
  name: 'activeTasks',
  initialState: activeTasksInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase('activeTasks/fetchTasks/pending', (state, action) => {
      state.status = 'loading';
    });
    builder.addCase('activeTasks/fetchTasks/fulfilled', (state, action: any) => {
      state.status = 'succeeded';
      activeTasksAdapter.upsertMany(state, action.payload);
    });
    builder.addCase('task/saveSubmission/fulfilled', (state, action) => {
      // TODO:depending upon structure of response
    });
  },
});

export const fetchActiveTasks = createAsyncThunk('activeTasks/fetchTasks', async () => {
  const tasks = await client.get('/task');
  return tasks.data.data;
});

export const createSubmission: any = createAsyncThunk(
  'task/creatSubmission',
  async ({ taskId, submission }: any) => {
    const createTask = await client.post(`/submission`, {
      scope: {
        model: 'task',
        id: taskId,
      },
      data: {
        ...submission,
      },
    });
    return createTask;
  },
);

export const saveSubmission: any = createAsyncThunk(
  'task/saveSubmission',
  async (submission: any) => {
    const saveTask = await client.patch(`/submission/${submission.id}`, {
      data: {
        ...submission,
      },
    });
  },
);

export const patchAndSubmitForReview = createAsyncThunk(
  'task/patchAndSubmitSubmissionForReview',
  async ({ userTaskId, submission }: any) => {
    const submitSubmissionForReview = await client.patch(`/submission/${submission.id}`, {
      data: {
        ...submission,
      },
    });
    await submissionToReviewStatus(userTaskId);
    return submitSubmissionForReview.data;
  },
);

export const createAndSubmitForReview = createAsyncThunk(
  'task/creatandSubmitSubmisionForReview',
  async ({ taskId, userTaskId, submission }: any) => {
    const createAndSubmitTaskForReview = await client.post('/submission', {
      scope: {
        model: 'task',
        id: taskId,
        status: 'review',
      },
      data: {
        ...submission,
      },
    });
    await submissionToReviewStatus(userTaskId);
    return createAndSubmitForReview.data;
  },
);

type RootState = ReturnType<typeof store.getState>;

export const {
  selectAll: selectAllActiveTasks,
  selectIds: selectIdsActiveTasks,
  selectEntities: selectEntitiesActiveTasks,
} = activeTasksAdapter.getSelectors<RootState>((state) => state.userTasks);

export default activeTasksSlice.reducer;
