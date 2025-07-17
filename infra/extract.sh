#!/bin/bash

# Output file
OUTPUT_FILE="ts_code.txt"
> "$OUTPUT_FILE"  # Clear the file if it exists

# Loop through all .ts files excluding node_modules
find . -type f -name "*.ts" ! -path "*/node_modules/*" | while read -r tsfile; do
    echo "==================== $tsfile ====================" >> "$OUTPUT_FILE"
    cat "$tsfile" >> "$OUTPUT_FILE"
    echo -e "\n\n" >> "$OUTPUT_FILE"
done

echo "Done. Output written to $OUTPUT_FILE"
