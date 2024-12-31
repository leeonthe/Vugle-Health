import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Back from '../../../../../assets/images/logo/back.svg'; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppointmentDatePage: React.FC = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedData, setSelectedData] = useState({
    date: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const route = useRoute();
  const { hospitalName } = route.params as { hospitalName: string };


  const navigateToHomePage = () => {
    navigation.goBack();
  };

  const handleNavigation = async () => {
    try {
      // Format the selected date into a full date string
      const formattedDate = new Date(
        selectedData.year,
        selectedData.month,
        selectedData.date
      ).toISOString();
  
      // Save the selected date to AsyncStorage
      await AsyncStorage.setItem("selectedDate", formattedDate);
  
      // Navigate to the next page
      navigation.navigate("AppointmentTimePage", { hospitalName });
    } catch (error) {
      console.error("Error saving selected date:", error);
    }
  };
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newMonth = direction === "next" ? prevDate.getMonth() + 1 : prevDate.getMonth() - 1;
      return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const rows = [];
    let cells = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayPlaceholder} />);
    }

    // Add day cells
    daysArray.forEach((day, index) => {
      cells.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.day,
            day === selectedDate && {
              backgroundColor: "#237AF2",
            },
          ]}
          onPress={() => {
            setSelectedDate(day);
            setSelectedData({ date: day, month, year });
          }}
        >
          <Text
            style={[
              styles.dayText,
              day === selectedDate && { color: "white" },
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );

      // If the row is complete (7 cells), add it to the rows array
      if ((index + firstDayOfMonth + 1) % 7 === 0) {
        rows.push(
          <View key={`row-${index}`} style={styles.weekRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    // Add the last row if there are remaining cells
    if (cells.length > 0) {
      while (cells.length < 7) {
        cells.push(<View key={`empty-end-${cells.length}`} style={styles.dayPlaceholder} />);
      }
      rows.push(
        <View key="last-row" style={styles.weekRow}>
          {cells}
        </View>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth("prev")}>
            <Text style={styles.arrow}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.monthYear}>{currentDate.toLocaleString("default", { month: "long" })} {year}</Text>
          <TouchableOpacity onPress={() => changeMonth("next")}>
            <Text style={styles.arrow}>{">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        {rows}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.back}>
        <TouchableOpacity onPress={navigateToHomePage}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}></View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Appointment date</Text>
      </View>

      {renderCalendar()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNavigation}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  } as ViewStyle,
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    marginTop: -18,
  } as ViewStyle,
  back: {
    marginTop: 80,
    marginLeft: 10,
  } as ViewStyle,
  titleContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 45,
    marginTop: -20,
    marginLeft: 10,
  } as ViewStyle,
  title: {
    color: "#222222",
    fontSize: 24,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
    lineHeight: 38,
  } as TextStyle,
  calendarContainer: {
    backgroundColor: "#white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  } as ViewStyle,
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,
  arrow: {
    fontSize: 20,
    color: "#237AF2",
  } as TextStyle,
  monthYear: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  } as TextStyle,
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  } as ViewStyle,
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7685",
  } as TextStyle,
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  } as ViewStyle,
  day: {
    width: "13%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 4,
  } as ViewStyle,
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222222",
  } as TextStyle,
  dayPlaceholder: {
    width: "13%",
    aspectRatio: 1,
  } as ViewStyle,
  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  } as ViewStyle,
  button: {
    width: 357,
    height: 52,
    backgroundColor: "#237AF2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "SF Pro Display",
    fontWeight: "500",
    lineHeight: 16,
  } as TextStyle,
});

export default AppointmentDatePage;
