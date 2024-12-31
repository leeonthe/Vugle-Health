import api from "../../services/axiosConfig";
import { PotentialCondition } from "../interfaces/dexTypes";

const fetchPotentialConditions = async (): Promise<PotentialCondition[]>=> {
  try {
    const response = await api.get<PotentialCondition[]>("dex/potential_conditions_list/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching potential conditions:", error);
    throw error;
  }
};

export default fetchPotentialConditions;
