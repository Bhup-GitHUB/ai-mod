#!/bin/bash

# Replace with your deployed URL
API_URL="http://localhost:8787"

# Test 1: Sentiment Analysis
echo "Test 1: Positive Sentiment"
curl -X POST $API_URL/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is absolutely amazing! Best product ever!",
    "features": ["sentiment"]
  }'

echo -e "\n\n"

# Test 2: Spam Detection
echo "Test 2: Spam Detection"
curl -X POST $API_URL/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "CLICK HERE NOW!!! Buy cheap products! Limited offer!!! Act fast!!!",
    "features": ["classification"]
  }'

echo -e "\n\n"

# Test 3: Full Analysis
echo "Test 3: Complete Moderation"
curl -X POST $API_URL/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The new smartphone features an incredible camera system with advanced AI capabilities. The battery life is impressive, lasting up to two days on a single charge. However, the price point might be a concern for budget-conscious consumers. Overall, its a solid device that competes well in the premium segment.",
    "features": ["all"]
  }'