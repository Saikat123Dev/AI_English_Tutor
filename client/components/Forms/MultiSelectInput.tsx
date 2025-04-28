import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * MultiSelectInput component for selecting multiple options
 * Works with react-hook-form
 *
 * @param {Object} props
 * @param {Object} props.control - react-hook-form control object
 * @param {string} props.name - Field name
 * @param {string} props.label - Input label
 * @param {boolean} props.required - If the field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {Array} props.options - Array of options with label and value
 * @param {Object} props.rules - Additional validation rules
 */
const MultiSelectInput = ({
  control,
  name,
  label,
  required = false,
  placeholder = "Select options",
  options = [],
  rules = {},
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add required validation if needed
  if (required) {
    rules.required = rules.required || "This field is required";
  }

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
        // Toggle selected option
        const toggleOption = (optionValue) => {
          const currentValue = value || [];

          if (currentValue.includes(optionValue)) {
            // Remove if already selected
            onChange(currentValue.filter((val) => val !== optionValue));
          } else {
            // Add if not selected
            onChange([...currentValue, optionValue]);
          }
        };

        // Format selected values for display
        const getSelectedLabels = () => {
          if (!value || value.length === 0) return "";

          return options
            .filter((option) => value.includes(option.value))
            .map((option) => option.label)
            .join(", ");
        };

        return (
          <View style={styles.container}>
            <Text style={styles.label}>
              {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            {/* Selected options display / dropdown trigger */}
            <TouchableOpacity
              style={[
                styles.inputContainer,
                isDropdownOpen && styles.inputContainerFocused,
                error && styles.inputContainerError,
              ]}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.selectedText,
                (!value || value.length === 0) && styles.placeholderText
              ]}>
                {getSelectedLabels() || placeholder}
              </Text>
              <MaterialIcons
                name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>

            {/* Dropdown options */}
            {isDropdownOpen && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.optionsScrollView} nestedScrollEnabled={true}>
                  {options.map((option) => {
                    const isSelected = value && value.includes(option.value);

                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                        onPress={() => toggleOption(option.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <MaterialIcons name="check" size={20} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Error message */}
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  required: {
    color: "red",
  },
  inputContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "gray",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  inputContainerFocused: {
    borderColor: "blue",
    borderWidth: 1.5,
  },
  inputContainerError: {
    borderColor: "red",
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  dropdownContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 4,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 1000,
  },
  optionsScrollView: {
    paddingVertical: 5,
  },
  optionItem: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  optionItemSelected: {
    backgroundColor: "blue",
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
});

export default MultiSelectInput;
