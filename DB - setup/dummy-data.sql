INSERT INTO users_table (email, password, name, admin) VALUES
('alice@example.com', 'hashedpass1', 'Alice', 1),
('bob@example.com', 'hashedpass2', 'Bob', 1),
('charlie@example.com', 'hashedpass3', 'Charlie', 0),
('dominic@example.com', 'hashedpass4', 'Dominic', 0),
('erica@example.com', 'hashedpass5', 'Eric', 1),
('fred@example.com', 'hashedpass6', 'Fred', 0),
('glinda@example.com', 'hashedpass7', 'Glinda', 0),
('hassan@example.com', 'hashedpass8', 'Hassan', 0),
('jacob@example.com', 'hashedpass9', 'Jacob', 1),
('kris@example.com', 'hashedpass10', 'Kris', 0);

INSERT INTO products_table (shopID, name, picture, info, price, amount, size) VALUES
(1, 'Klassisk T-Shirt', 'https://dansk.dk/img/1500/1500/resize/0/5/0510_001_pack_1_web_1.png', 'Bomulds t-shirt med rund hals', 199, 20, 'M'),
(2, 'Denim Jeans', 'https://images.only.com/15234743/3860808/001/only-onljuicyhwwidelegdnmrea365noos-blaa.jpg?v=1d0559dbf5250ea23f4dcbd1bb39179a&format=webp&width=1280&quality=90&key=25-0-3', 'Straight fit blå jeans', 499, 10, 'L'),
(3, 'Canvas Sneakers', 'https://umame.dk/wp-content/uploads/2020/08/KW_K192495-1032-M0820TA.jpg', 'Lette canvas sneakers', 299, 15, '42'),
(4, 'Stråhat', 'https://hatshop.dk/images/zoom/hatt_garda_straw_hat_natural_ssk4_02.jpg', 'En lys sommerhas', 149, 16, '60'),
(5, 'Røde hæle', 'https://abrikos.webshop8.dk/images/6.jpg', 'Røde høje hæle med sort bund', 439, 15, '39'),
(6, 'Sommerkjole', 'https://www.gundtoft.dk/shared/133/495/betty-barclay-raffineret-sommerkjole_580x773c.jpg', 'En stribes sommerkjole i polyester', 699, 12, 'M'),
(7, 'Solbriller', 'https://images.specsavers.com/glasses-images/30800854-front-940x529.jpg', 'Runde solbriller', 229, 21, '32'),
(8, 'Blå Hoodie', 'https://static.molo.com/molo-style/-dreng-troejer-cardigans-mash-royal-blue-/1s20j310_8132_b.jpg?width=1000&height=1200&trim.threshold=90&bgcolor=white', 'En blå hoodie med lynlås', 329, 15, 'L'),
(9, 'Læderjakke', 'https://shop62395.sfstatic.io/upload_dir/shop/webshop/fmc_veste/_thumbs/Enforcer1.w610.h610.backdrop.jpg', 'En jakke af rigtigt læder', 799, 12, 'M'),
(10, 'Hvid skjorte', 'https://www.fotoagent.dk/single_picture/11321/138/large/24901000007-hvid_1.jpg', 'En klassisk hvid skjorte', 199, 21, 'S');

INSERT INTO events_table (price, place, info, name, image, time) VALUES
(0, 'Parken', 'Fælles udendøres yoga', 'Morgen Yoga','https://yoganowchicago.com/wp-content/uploads/2020/09/women-doing-yoga-outdoors-at-sunrise-morning-medit-ZXFC64Y.jpg', '2025-05-01 08:00'),
(150, 'Musikkens hus', 'Live jazz koncert', 'Jazz Aften', 'https://jazzfest.dk/images/news/big/2985.jpg','2025-05-10 19:00'),
(75, 'Forum', 'Street food festival', 'Food Fest', 'https://piskeriset.dk/wp-content/uploads/2021/09/aalborgstreetfood6-1024x768.jpg','2025-06-10 12:00'),
(0, 'Louis butik', 'Fremvisning af tøj', 'Fashion show','https://lirp.cdn-website.com/f21760dc/dms3rep/multi/opt/shutterstock_583752907-1920w.jpg', '2025-06-12 12:00'),
(250, 'Teater', 'Teater produktion', 'Skatteøen', 'https://pb2eu.interticket.com/imgs/system-6/program/000/004/575/skatteoen-original-3767.jpg','2025-10-08 19:00'),
(25, 'Domen', 'Hold 1 mod hold 2', 'Fodboldkamp', 'https://images-bonnier.imgix.net/files/his/production/2015/07/07091921/ball-4353214_1920.jpg?auto=compress,format&w=2618&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5','2025-02-13 15:00'),
(0, 'Spilcafeen', 'Kom og spil brætspil', 'Brætspilscafe','https://files.guidedanmark.org/files/484/209363_Aarhus-Braetspilscafe-indendoers.jpg', '2025-13-7 19:00'),
(250, 'Keramikcafeen', 'Mal en kop', 'Keramikcafe', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZQ9EuZGxIiZJXrIKKOQrycKaN9tBwrGMMKA&s','2025-02-04 13:00'),
(20, 'Gigantum', 'Kæmpe loppemarked', 'Loppemarked', 'https://aarhusinside.dk/wp-content/uploads/2023/03/Loppemarked-Godsbanen.jpg','2025-08-09 10:00'),
(135, 'Gigantum', 'Køb og salg af krybdyr', 'Reptilmesse','https://reptilmesser.dk/wp-content/uploads/photo-gallery/djFhTzMDoIwW.jpg?bwg=1710015134', '2025-06-12 10:00');



INSERT INTO products_filters (productID, black, white, pants, t_shirt, cotton, polyester) VALUES
(1, 1, 1, 0, 1, 1, 0),
(2, 0, 0, 1, 0, 0, 1),
(3, 0, 0, 1, 1, 0, 1),
(4, 1, 0, 0, 0, 1, 0),
(5, 1, 1, 1, 0, 0, 1),
(6, 0, 0, 0, 1, 0, 0),
(7, 1, 1, 1, 0, 0, 1),
(8, 1, 1, 1, 0, 0, 1),
(9, 0, 0, 0, 1, 0, 0),
(10, 1, 1, 1, 0, 0, 1);

INSERT INTO user_events (userID, eventID) VALUES
(1, 6),
(1, 2),
(3, 6),
(2, 6),
(3, 1),
(5, 6),
(6, 1),
(4, 1),
(4, 6);