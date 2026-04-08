import urllib.request
def D(u, n):
    try:
        urllib.request.urlretrieve(u, f"d:/AdharCoffe/AdharCoffe/public/{n}")
        print("OK", n)
    except Exception as e:
        print("FAIL", n, e)

D("https://www.resepistimewa.com/wp-content/uploads/roti-bakar-bandung.jpg", "roti.jpg")
D("https://asset.kompas.com/crops/-B8rLwO9Yg-J4mQz8G-U6vQ7bTQ=/0x0:800x533/750x500/data/photo/2022/12/05/638da0ab9148d.jpg", "teh.jpg")
D("https://selerasa.com/wp-content/uploads/2015/12/images_gorengan_bola_ubi.jpg", "ubi.jpg")
