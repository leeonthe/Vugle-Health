import api from "../../services/axiosConfig";
import { AppointmentInfo } from "../interfaces/dexTypes";

const fetchAppointmentInfo = async (): Promise<AppointmentInfo[]>=> {
  try {
    const response = await api.get<AppointmentInfo[]>("dex/get_branch_of_medicine_and_appointment_message/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching potential conditions:", error);
    throw error;
  }
};

export default fetchAppointmentInfo;