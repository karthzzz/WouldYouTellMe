import sqlite3

conn = sqlite3.connect('confessions.db')
cursor = conn.cursor()

print('\n' + '='*60)
print('📊 DATABASE SCHEMA INSPECTION')
print('='*60)

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

for table in tables:
    table_name = table[0]
    print(f'\n📋 TABLE: {table_name.upper()}')
    print('-' * 60)
    
    # Get columns
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    
    for col in columns:
        col_id, name, dtype, not_null, default_val, pk = col
        pk_mark = '🔑 PRIMARY KEY' if pk else ''
        nullable = 'NULLABLE' if not not_null else 'NOT NULL'
        default = f'DEFAULT: {default_val}' if default_val else ''
        
        print(f'  {name:25} | {dtype:15} | {nullable:10} | {pk_mark} {default}')
    
    # Get row count
    cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
    count = cursor.fetchone()[0]
    print(f'  → Total rows: {count}')

print('\n' + '='*60)
print('🔗 FOREIGN KEY RELATIONSHIPS')
print('='*60)

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
for table in cursor.fetchall():
    table_name = table[0]
    cursor.execute(f'PRAGMA foreign_key_list({table_name})')
    fks = cursor.fetchall()
    if fks:
        print(f'\n{table_name}:')
        for fk in fks:
            seq, col_id, ref_table, from_col, to_col, on_delete, on_update, match = fk
            print(f'  {from_col} → {ref_table}.{to_col}')

print('\n' + '='*60)
print('📈 DATA STATISTICS')
print('='*60)

cursor.execute("SELECT COUNT(*) FROM users")
user_count = cursor.fetchone()[0]
print(f'Total Users: {user_count}')

cursor.execute("SELECT COUNT(*) FROM confessions")
confession_count = cursor.fetchone()[0]
print(f'Total Confessions: {confession_count}')

cursor.execute("SELECT COUNT(*) FROM subscriptions")
subscription_count = cursor.fetchone()[0]
print(f'Total Subscriptions: {subscription_count}')

cursor.execute("SELECT status, COUNT(*) FROM confessions GROUP BY status")
print('\nConfessions by Status:')
for status, count in cursor.fetchall():
    print(f'  {status}: {count}')

cursor.execute("SELECT COUNT(*) FROM confessions WHERE is_free = 1")
free_count = cursor.fetchone()[0]
print(f'\nFree Messages Used: {free_count}')

cursor.execute("SELECT COUNT(*) FROM confessions WHERE is_free = 0")
paid_count = cursor.fetchone()[0]
print(f'Paid Confessions: {paid_count}')

conn.close()
print('\n✅ Database inspection complete!\n')
