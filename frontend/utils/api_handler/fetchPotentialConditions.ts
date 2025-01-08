import api from "../../services/axiosConfig";
import { PotentialCondition } from "../interfaces/dexTypes";

const fetchPotentialConditions = async (): Promise<PotentialCondition[]>=> {
  try {
    const response = await api.get<PotentialCondition[]>("dex/potential_conditions_list/");
    return response.data;
  } catch (error) {
    console.log("Error fecthing potnetial conditions:" , error.response?.data || error.messages);
    throw error;
  }
};

export default fetchPotentialConditions;
