import api from "../../services/axiosConfig";

const fetchDexResponse = async () => {
  try {
    const response = await api.get("dex/suitable_claim_type/");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching potential conditions:", error);
    throw error;
  }
};

export default fetchDexResponse;
