from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, time, timedelta
import random

from api.models import MockNIDDatabase, Station, Trip

class Command(BaseCommand):
    help = 'Seeds the database with stations, trips, and mock NID data for Bangladesh'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # 1. Clear existing data to avoid duplicates
        MockNIDDatabase.objects.all().delete()
        Station.objects.all().delete()
        Trip.objects.all().delete()

        # 2. Seed Mock NID Database
        nids = [
            {
                "nid_number": "1234567890",
                "full_name": "Rakibul Islam",
                "father_name": "Aminul Islam",
                "mother_name": "Kamrun Nahar",
                "dob": datetime.strptime("1995-06-15", "%Y-%m-%d").date(),
                "address": "House 45, Road 12, Dhanmondi, Dhaka"
            },
            {
                "nid_number": "9876543210",
                "full_name": "Ayesha Siddiqua",
                "father_name": "Abdur Rahman",
                "mother_name": "Fatema Begum",
                "dob": datetime.strptime("1998-10-20", "%Y-%m-%d").date(),
                "address": "MIA Bari, Kazir Dewri, Chittagong"
            },
            {
                "nid_number": "1122334455",
                "full_name": "Naimur Rahman",
                "father_name": "Mizanur Rahman",
                "mother_name": "Salma Akter",
                "dob": datetime.strptime("1990-12-01", "%Y-%m-%d").date(),
                "address": "Sylhet Road, Subhanighat, Sylhet"
            },
            {
                "nid_number": "5566778899",
                "full_name": "Sadia Islam",
                "father_name": "Tariqul Islam",
                "mother_name": "Jahanara Islam",
                "dob": datetime.strptime("2001-02-28", "%Y-%m-%d").date(),
                "address": "Kolatoli Road, Cox's Bazar"
            },
            {
                "nid_number": "9988776655",
                "full_name": "Mahmudul Hasan",
                "father_name": "Siddiqur Rahman",
                "mother_name": "Laila Arzumand",
                "dob": datetime.strptime("1985-04-05", "%Y-%m-%d").date(),
                "address": "Motihar, Rajshahi"
            }
        ]

        for item in nids:
            MockNIDDatabase.objects.create(**item)
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(nids)} Mock NID profiles'))

        # 3. Seed Stations with Bilingual Names (English + Bangla)
        stations_data = [
            # Dhaka
            {"name": "Dhaka Gabtoli (ঢাকা গাবতলী)", "code": "DAC-BUS-G", "district": "Dhaka", "is_bus_terminal": True},
            {"name": "Dhaka Kamalapur (ঢাকা কমলাপুর)", "code": "DAC-RLY-K", "district": "Dhaka", "is_railway": True},
            {"name": "Hazrat Shahjalal Int Airport (হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর)", "code": "DAC-AIR-S", "district": "Dhaka", "is_airport": True},
            
            # Chittagong
            {"name": "Chittagong Dampara (চট্টগ্রাম দামপাড়া)", "code": "CGP-BUS-D", "district": "Chittagong", "is_bus_terminal": True},
            {"name": "Chittagong Station (চট্টগ্রাম স্টেশন)", "code": "CGP-RLY-S", "district": "Chittagong", "is_railway": True},
            {"name": "Shah Amanat Int Airport (শাহ আমানত আন্তর্জাতিক বিমানবন্দর)", "code": "CGP-AIR-A", "district": "Chittagong", "is_airport": True},
            
            # Sylhet
            {"name": "Sylhet Kadamtali (সিলেট কদমতলী)", "code": "ZYL-BUS-K", "district": "Sylhet", "is_bus_terminal": True},
            {"name": "Sylhet Station (সিলেট স্টেশন)", "code": "ZYL-RLY-S", "district": "Sylhet", "is_railway": True},
            {"name": "Osmani International Airport (ওসমানী আন্তর্জাতিক বিমানবন্দর)", "code": "ZYL-AIR-O", "district": "Sylhet", "is_airport": True},
            
            # Cox's Bazar
            {"name": "Cox's Bazar Kolatoli (কক্সবাজার কলাতলী)", "code": "CXB-BUS-K", "district": "Cox's Bazar", "is_bus_terminal": True},
            {"name": "Cox's Bazar Station (কক্সবাজার স্টেশন)", "code": "CXB-RLY-S", "district": "Cox's Bazar", "is_railway": True},
            {"name": "Cox's Bazar Airport (কক্সবাজার বিমানবন্দর)", "code": "CXB-AIR-A", "district": "Cox's Bazar", "is_airport": True},
            
            # Rajshahi
            {"name": "Rajshahi Terminal (রাজশাহী টার্মিনাল)", "code": "RJH-BUS-T", "district": "Rajshahi", "is_bus_terminal": True},
            {"name": "Rajshahi Station (রাজশাহী স্টেশন)", "code": "RJH-RLY-S", "district": "Rajshahi", "is_railway": True},
            {"name": "Shah Makhdum Airport (শাহ মখদুম বিমানবন্দর)", "code": "RJH-AIR-M", "district": "Rajshahi", "is_airport": True},

            # Khulna
            {"name": "Khulna Terminal (খুলনা টার্মিনাল)", "code": "KHU-BUS-T", "district": "Khulna", "is_bus_terminal": True},
            {"name": "Khulna Station (খুলনা স্টেশন)", "code": "KHU-RLY-S", "district": "Khulna", "is_railway": True},

            # Benapole
            {"name": "Benapole Terminal (বেনাপোল টার্মিনাল)", "code": "BEN-BUS-T", "district": "Benapole", "is_bus_terminal": True},
            {"name": "Benapole Station (বেনাপোল স্টেশন)", "code": "BEN-RLY-S", "district": "Benapole", "is_railway": True},

            # Jashore
            {"name": "Jashore Terminal (যশোর টার্মিনাল)", "code": "JSR-BUS-T", "district": "Jashore", "is_bus_terminal": True},
            {"name": "Jashore Station (যশোর স্টেশন)", "code": "JSR-RLY-S", "district": "Jashore", "is_railway": True},
            {"name": "Jashore Airport (যশোর বিমানবন্দর)", "code": "JSR-AIR-J", "district": "Jashore", "is_airport": True},

            # Teknaf
            {"name": "Teknaf Terminal (টেকনাফ টার্মিনাল)", "code": "TKF-BUS-T", "district": "Teknaf", "is_bus_terminal": True},

            # Tetulia
            {"name": "Tetulia Terminal (টেঁতুলিয়া টার্মিনাল)", "code": "TTL-BUS-T", "district": "Tetulia", "is_bus_terminal": True},

            # Panchagarh
            {"name": "Panchagarh Terminal (পঞ্চগড় টার্মিনাল)", "code": "PAN-BUS-T", "district": "Panchagarh", "is_bus_terminal": True},
            {"name": "Panchagarh Station (পঞ্চগড় স্টেশন)", "code": "PAN-RLY-S", "district": "Panchagarh", "is_railway": True},
        ]

        stations = {}
        for s in stations_data:
            obj = Station.objects.create(**s)
            stations[s['code']] = obj
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(stations_data)} Stations'))

        # Helper to generate seat layouts
        def get_bus_layout():
            layout = {}
            for row in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']:
                for col in ['1', '2', '3', '4']:
                    layout[f"{row}{col}"] = random.choice([True, True, True, False])
            return layout

        def get_train_layout():
            layout = {}
            for i in range(1, 61):
                layout[f"S{i}"] = random.choice([True, True, True, False])
            return layout

        def get_plane_layout():
            layout = {}
            for row in range(1, 11):
                for col in ['A', 'B', 'C', 'D', 'E', 'F']:
                    layout[f"{row}{col}"] = random.choice([True, True, True, False])
            return layout

        # Seeding Operators
        operators = {
            'BUS': [
                {'name': 'Green Line Paribahan (গ্রীন লাইন পরিবহন)', '经济price': 700.00, '商务price': 1300.00, 'code': 'GL'},
                {'name': 'Hanif Enterprise (হানিফ এন্টারপ্রাইজ)', '经济price': 480.00, '商务price': 1100.00, 'code': 'HN'},
                {'name': 'Shohagh Paribahan (সোহাগ পরিবহন)', '经济price': 650.00, '商务price': 1200.00, 'code': 'SH'},
                {'name': 'Ena Transport (এনা ট্রান্সপোর্ট)', '经济price': 500.00, '商务price': 950.00, 'code': 'EN'},
                {'name': 'Liton Travels (লিটন ট্রাভেলস)', '经济price': 450.00, '商务price': 900.00, 'code': 'LT'},
                {'name': 'Shyamoli Paribahan (শ্যামলী পরিবহন)', '经济price': 520.00, '商务price': 1000.00, 'code': 'SP'},
                {'name': 'Nabil Paribahan (নাবিল পরিবহন)', '经济price': 500.00, '商务price': 950.00, 'code': 'NP'},
                {'name': 'Saintmartin Travels (সেন্টমার্টিন ট্রাভেলস)', '经济price': 800.00, '商务price': 1400.00, 'code': 'SM'},
                {'name': 'Desh Travels (দেশ ট্রাভেলস)', '经济price': 550.00, '商务price': 1150.00, 'code': 'DT'},
                {'name': 'SR Travels (এসআর ট্রাভেলস)', '经济price': 500.00, '商务price': 1000.00, 'code': 'SR'},
                {'name': 'Unique Service (ইউনিক সার্ভিস)', '经济price': 480.00, '商务price': 950.00, 'code': 'UQ'},
                {'name': 'Sakura Paribahan (সাকুরা পরিবহন)', '经济price': 450.00, '商务price': 900.00, 'code': 'SK'},
            ],
            'PLANE': [
                {'name': 'Biman Bangladesh Airlines (বিমান বাংলাদেশ এয়ারলাইন্স)', '经济price': 4500.00, '商务price': 8500.00, 'code': 'BG'},
                {'name': 'US-Bangla Airlines (ইউএস-বাংলা এয়ারলাইন্স)', '经济price': 5200.00, '商务price': 9500.00, 'code': 'BS'},
                {'name': 'Novoair (নভোএয়ার)', '经济price': 5000.00, '商务price': 9000.00, 'code': 'VQ'},
                {'name': 'Air Astra (এয়ার অ্যাস্ট্রা)', '经济price': 4800.00, '商务price': 8800.00, 'code': '2A'}
            ]
        }

        # Routes list: (Source Station Code, Destination Station Code, Type, Duration Hours)
        routes = [
            # --- BUS ROUTES ---
            ('DAC-BUS-G', 'CGP-BUS-D', 'BUS', 6.0),
            ('CGP-BUS-D', 'DAC-BUS-G', 'BUS', 6.0),
            ('DAC-BUS-G', 'ZYL-BUS-K', 'BUS', 5.0),
            ('ZYL-BUS-K', 'DAC-BUS-G', 'BUS', 5.0),
            ('DAC-BUS-G', 'CXB-BUS-K', 'BUS', 8.0),
            ('CXB-BUS-K', 'DAC-BUS-G', 'BUS', 8.0),
            ('DAC-BUS-G', 'RJH-BUS-T', 'BUS', 5.0),
            ('RJH-BUS-T', 'DAC-BUS-G', 'BUS', 5.0),
            ('DAC-BUS-G', 'KHU-BUS-T', 'BUS', 6.0),
            ('KHU-BUS-T', 'DAC-BUS-G', 'BUS', 6.0),
            ('DAC-BUS-G', 'BEN-BUS-T', 'BUS', 7.0),
            ('BEN-BUS-T', 'DAC-BUS-G', 'BUS', 7.0),
            ('DAC-BUS-G', 'JSR-BUS-T', 'BUS', 5.0),
            ('JSR-BUS-T', 'DAC-BUS-G', 'BUS', 5.0),
            ('DAC-BUS-G', 'TKF-BUS-T', 'BUS', 10.0),
            ('TKF-BUS-T', 'DAC-BUS-G', 'BUS', 10.0),
            ('DAC-BUS-G', 'TTL-BUS-T', 'BUS', 11.0),
            ('TTL-BUS-T', 'DAC-BUS-G', 'BUS', 11.0),
            ('DAC-BUS-G', 'PAN-BUS-T', 'BUS', 9.5),
            ('PAN-BUS-T', 'DAC-BUS-G', 'BUS', 9.5),
            ('TKF-BUS-T', 'TTL-BUS-T', 'BUS', 17.5),
            ('TTL-BUS-T', 'TKF-BUS-T', 'BUS', 17.5),
            ('CGP-BUS-D', 'CXB-BUS-K', 'BUS', 3.0),
            ('CXB-BUS-K', 'CGP-BUS-D', 'BUS', 3.0),

            # --- TRAIN ROUTES ---
            ('DAC-RLY-K', 'CGP-RLY-S', 'TRAIN', 5.5),
            ('CGP-RLY-S', 'DAC-RLY-K', 'TRAIN', 5.5),
            ('DAC-RLY-K', 'ZYL-RLY-S', 'TRAIN', 6.0),
            ('ZYL-RLY-S', 'DAC-RLY-K', 'TRAIN', 6.0),
            ('DAC-RLY-K', 'CXB-RLY-S', 'TRAIN', 7.5),
            ('CXB-RLY-S', 'DAC-RLY-K', 'TRAIN', 7.5),
            ('DAC-RLY-K', 'RJH-RLY-S', 'TRAIN', 4.5),
            ('RJH-RLY-S', 'DAC-RLY-K', 'TRAIN', 4.5),
            ('DAC-RLY-K', 'KHU-RLY-S', 'TRAIN', 5.5),
            ('KHU-RLY-S', 'DAC-RLY-K', 'TRAIN', 5.5),
            ('DAC-RLY-K', 'BEN-RLY-S', 'TRAIN', 6.5),
            ('BEN-RLY-S', 'DAC-RLY-K', 'TRAIN', 6.5),
            ('DAC-RLY-K', 'JSR-RLY-S', 'TRAIN', 5.0),
            ('JSR-RLY-S', 'DAC-RLY-K', 'TRAIN', 5.0),
            ('DAC-RLY-K', 'PAN-RLY-S', 'TRAIN', 8.5),
            ('PAN-RLY-S', 'DAC-RLY-K', 'TRAIN', 8.5),
            ('RJH-RLY-S', 'KHU-RLY-S', 'TRAIN', 4.0),
            ('KHU-RLY-S', 'RJH-RLY-S', 'TRAIN', 4.0),

            # --- PLANE ROUTES ---
            ('DAC-AIR-S', 'CGP-AIR-A', 'PLANE', 0.8),
            ('CGP-AIR-A', 'DAC-AIR-S', 'PLANE', 0.8),
            ('DAC-AIR-S', 'ZYL-AIR-O', 'PLANE', 0.7),
            ('ZYL-AIR-O', 'DAC-AIR-S', 'PLANE', 0.7),
            ('DAC-AIR-S', 'CXB-AIR-A', 'PLANE', 1.0),
            ('CXB-AIR-A', 'DAC-AIR-S', 'PLANE', 1.0),
            ('DAC-AIR-S', 'RJH-AIR-M', 'PLANE', 0.7),
            ('RJH-AIR-M', 'DAC-AIR-S', 'PLANE', 0.7),
            ('DAC-AIR-S', 'JSR-AIR-J', 'PLANE', 0.6),
            ('JSR-AIR-J', 'DAC-AIR-S', 'PLANE', 0.6),
        ]

        today = timezone.localtime().date()
        trip_count = 0

        # Generate trips for today and the next 14 days
        for day_offset in range(15):
            current_date = today + timedelta(days=day_offset)
            
            for src_code, dest_code, t_type, duration in routes:
                src_station = stations.get(src_code)
                dest_station = stations.get(dest_code)
                
                if not src_station or not dest_station:
                    continue
                
                # Fetch route-specific train list or general bus/plane operators
                if t_type == 'TRAIN':
                    route_key = (src_code, dest_code)
                    if route_key in [('DAC-RLY-K', 'CGP-RLY-S'), ('CGP-RLY-S', 'DAC-RLY-K')]:
                        trains_for_route = [
                            {'name': 'Subarna Express (সুবর্ণ এক্সপ্রেস)', '经济price': 380.00, '商务price': 800.00, 'code': '701'},
                            {'name': 'Sonar Bangla Express (সোনার বাংলা এক্সপ্রেস)', '经济price': 400.00, '商务price': 900.00, 'code': '787'},
                            {'name': 'Chottala Express (চট্টলা এক্সপ্রেস)', '经济price': 340.00, '商务price': 720.00, 'code': '702'},
                        ]
                    elif route_key in [('DAC-RLY-K', 'RJH-RLY-S'), ('RJH-RLY-S', 'DAC-RLY-K')]:
                        trains_for_route = [
                            {'name': 'Bonolota Express (বনলতা এক্সপ্রেস)', '经济price': 380.00, '商务price': 800.00, 'code': '791'},
                            {'name': 'Silkcity Express (সিল্কসিটি এক্সপ্রেস)', '经济price': 360.00, '商务price': 760.00, 'code': '761'},
                        ]
                    elif route_key in [('DAC-RLY-K', 'BEN-RLY-S'), ('BEN-RLY-S', 'DAC-RLY-K')]:
                        trains_for_route = [
                            {'name': 'Benapole Express (বেনাপোল এক্সপ্রেস)', '经济price': 390.00, '商务price': 820.00, 'code': '795'},
                            {'name': 'Ruposhi Bangla Express (রূপসী বাংলা এক্সপ্রেস)', '经济price': 350.00, '商务price': 750.00, 'code': '721'},
                        ]
                    elif route_key in [('DAC-RLY-K', 'KHU-RLY-S'), ('KHU-RLY-S', 'DAC-RLY-K')]:
                        trains_for_route = [
                            {'name': 'Sundarban Express (সুন্দরবন এক্সপ্রেস)', '经济price': 370.00, '商务price': 790.00, 'code': '725'},
                            {'name': 'Chitra Express (চিত্রা এক্সপ্রেস)', '经济price': 360.00, '商务price': 760.00, 'code': '763'},
                        ]
                    elif route_key in [('DAC-RLY-K', 'ZYL-RLY-S'), ('ZYL-RLY-S', 'DAC-RLY-K')]:
                        trains_for_route = [
                            {'name': 'Parabat Express (পারাবত এক্সপ্রেস)', '经济price': 340.00, '商务price': 730.00, 'code': '709'},
                            {'name': 'Jayanti Express (জয়ন্তিকা এক্সপ্রেস)', '经济price': 320.00, '商务price': 680.00, 'code': '713'},
                        ]
                    elif route_key in [('DAC-RLY-K', 'PAN-RLY-S'), ('PAN-RLY-S', 'DAC-RLY-K')]:
                        trains_for_route = [
                            {'name': 'Panchagarh Express (পঞ্চগড় এক্সপ্রেস)', '经济price': 420.00, '商务price': 950.00, 'code': '793'},
                            {'name': 'Drutojan Express (দ্রুতযান এক্সপ্রেস)', '经济price': 400.00, '商务price': 880.00, 'code': '757'},
                        ]
                    elif route_key in [('RJH-RLY-S', 'KHU-RLY-S'), ('KHU-RLY-S', 'RJH-RLY-S')]:
                        trains_for_route = [
                            {'name': 'Kapotaksha Express (কপোতাক্ষ এক্সপ্রেস)', '经济price': 330.00, '商务price': 700.00, 'code': '715'},
                            {'name': 'Sagardari Express (সাগরদাঁড়ি এক্সপ্রেস)', '经济price': 330.00, '商务price': 700.00, 'code': '761'},
                        ]
                    else:
                        trains_for_route = [
                            {'name': 'Karnaphuli Express (কর্ণফুলী এক্সপ্রেস)', '经济price': 300.00, '商务price': 650.00, 'code': '712'},
                        ]
                    selected_ops = trains_for_route
                else:
                    ops = operators[t_type]
                    k_count = 5 if t_type == 'BUS' else 2
                    selected_ops = random.sample(ops, k=min(k_count, len(ops)))
                
                for idx, op in enumerate(selected_ops):
                    # Spread out schedule times based on transport mode
                    if t_type == 'BUS':
                        hour = [7, 11, 15, 19, 23][idx] if idx < 5 else 12
                    else:
                        hour = [7, 16][idx] if idx < 2 else 12
                    departure = timezone.make_aware(datetime.combine(current_date, time(hour, 0)))
                    arrival = departure + timedelta(hours=duration)
                    
                    if t_type == 'BUS':
                        layout = get_bus_layout()
                        total_seats = 40
                    elif t_type == 'TRAIN':
                        layout = get_train_layout()
                        total_seats = 60
                    else: # PLANE
                        layout = get_plane_layout()
                        total_seats = 60
                    
                    available_seats = sum(1 for val in layout.values() if val is True)
                    
                    # Random price modifier
                    price_modifier = 1.0 + (random.randint(-5, 12) / 100.0)
                    fare_econ = round(op['经济price'] * price_modifier, 0)
                    fare_bus = round(op['商务price'] * price_modifier, 0) if op['商务price'] else None
                    
                    identifier = f"{op['code']}-{random.randint(100, 999)}"
                    
                    Trip.objects.create(
                        transport_type=t_type,
                        operator_name=op['name'],
                        transport_identifier=identifier,
                        source=src_station,
                        destination=dest_station,
                        departure_time=departure,
                        arrival_time=arrival,
                        fare_economy=fare_econ,
                        fare_business=fare_bus,
                        total_seats=total_seats,
                        available_seats=available_seats,
                        seat_layout=layout
                    )
                    trip_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {trip_count} Trips over the next 15 days!'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed.'))
