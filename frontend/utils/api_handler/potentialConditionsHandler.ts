import api from "../../services/axiosConfig"; // Adjust the path to match your project structure
import { PotentialCondition } from "../interfaces/dexTypes";

const fetchPotentialConditions = async (): Promise<PotentialCondition[]>=> {
  try {
    const response = await api.get<PotentialCondition[]>("/potential_conditions_list/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching potential conditions:", error);
    throw error;
  }
};

export default fetchPotentialConditions;