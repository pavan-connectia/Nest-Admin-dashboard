import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  _id: string;
  name: string;
  email: string;
  token: string;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  _id: "",
  name: "",
  email: "",
  token: "",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        _id: string;
        name: string;
        email: string;
        token: string;
      }>
    ) => {
      const { _id, name, email, token } = action.payload;
      state._id = _id;
      state.name = name;
      state.email = email;
      state.token = token;
      state.isLoggedIn = true;
    },

    // ⭐ FIXED — Added updateUserState reducer
    updateUserState: (
      state,
      action: PayloadAction<{
        name?: string;
        email?: string;
      }>
    ) => {
      if (action.payload.name) state.name = action.payload.name;
      if (action.payload.email) state.email = action.payload.email;
    },

    logoutUser: (state) => {
      state._id = "";
      state.name = "";
      state.email = "";
      state.token = "";
      state.isLoggedIn = false;
    },
  },
});

export const { loginSuccess, logoutUser, updateUserState } =
  userSlice.actions;

export default userSlice.reducer;
