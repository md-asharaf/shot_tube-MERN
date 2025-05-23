import { IShortData } from "@/interfaces";
import { createSlice } from "@reduxjs/toolkit";
interface Short {
    openCard:string;
    shorts: IShortData[];
    randomShortId: string;
}
const initialState:Short = {
    openCard:"",
    shorts:[],
    randomShortId: "",
}
const shortSlice = createSlice({
    name: "short",
    initialState,
    reducers:{
        setShorts:(state, action)=>{
            state.shorts = action.payload;
        },
        setRandomShortId:(state,action)=>{
            state.randomShortId = action.payload;
        },
        setOpenCard:(state,action)=>{
            state.openCard=action.payload;
        }
    }
})


export const { setShorts, setRandomShortId,setOpenCard } = shortSlice.actions;

export default shortSlice.reducer;