import api from "../../services/axiosConfig";
import { AppointmentInfo } from "../interfaces/dexTypes";

const fetchAppointmentInfo = async (): Promise<AppointmentInfo[]>=> {
  try {
    const response = await api.get<AppointmentInfo[]>("dex/get_branch_of_medicine_and_appointment_message/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default fetchAppointmentInfo;