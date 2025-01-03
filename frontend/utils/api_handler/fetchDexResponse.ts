import api from "../../services/axiosConfig";

const fetchDexResponse = async () => {
  try {
    const response = await api.get("dex/suitable_claim_type/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default fetchDexResponse;
