import React from "react";
import { Control, Controller } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type Option = {
  label: string;
  value: string;
};

type HorizontalScrollRadioButtonInputProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options: Option[];
};

const HorizontalScrollRadioButtonInput = ({
  control,
  name,
  label,
  placeholder,
  required,
  options,
}: HorizontalScrollRadioButtonInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? `${label} is required` : false }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>
            {label} {required && <Text style={styles.requiredStar}>*</Text>}
          </Text>

          {placeholder && <Text style={styles.placeholder}>{placeholder}</Text>}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.scrollContainer}
            contentContainerStyle={styles.optionsContainer}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => onChange(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  requiredStar: {
    color: "red",
  },
  placeholder: {
    fontSize: 12,
    color: "gray",
  },
  scrollContainer: {
    flexGrow: 0,
    marginVertical: 5,
  },
  optionsContainer: {
    paddingVertical: 5,
    gap: 10,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  optionText: {
    fontWeight: "500",
    color: "#333",
  },
  selectedOptionText: {
    color: "white",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default HorizontalScrollRadioButtonInput;
