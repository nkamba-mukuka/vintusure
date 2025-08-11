import csv
from faker import Faker

fake = Faker()

# Define the number of customers you want to generate
num_customers = 1000

# Define the headers for the CSV file
headers = ['CustomerID', 'FirstName', 'LastName', 'Email', 'PhoneNumber', 'Country']

# Open the CSV file in write mode
with open('customers_1000.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(headers)
    
    # Generate and write customer data
    for i in range(1, num_customers + 1):
        customer_id = i
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = f"{first_name.lower()}.{last_name.lower()}@example.com"
        phone_number = fake.phone_number()
        country = fake.country()
        
        writer.writerow([customer_id, first_name, last_name, email, phone_number, country])

print(f"Successfully generated {num_customers} customer records in customers_1000.csv")