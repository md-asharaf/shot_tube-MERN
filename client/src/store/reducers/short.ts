import { IShortData } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
        setRandomShortId:(state,action:PayloadAction<string>)=>{
            console.log({shortId:action.payload})
            state.randomShortId = action.payload;
        },
        setOpenCard:(state,action)=>{
            state.openCard=action.payload;
        }
    }
})


export const { setShorts, setRandomShortId,setOpenCard } = shortSlice.actions;

export default shortSlice.reducer;