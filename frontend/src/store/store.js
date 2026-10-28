import { configureStore } from "@reduxjs/toolkit";
import hrmReducer from "./hrmSlice.js";
import { hrmListener } from "./middleware.js";

export const store = configureStore({
  reducer: { hrm: hrmReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(hrmListener.middleware),
});
