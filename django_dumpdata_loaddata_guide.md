# Django: хүснэгтийг JSON болгон хадгалах ба сэргээх гарын авлага

Төсөл: Django + PostgreSQL, Windows 10, VS Code (PowerShell терминал)
Хамрах хүснэгтүүд: `users.user`, `proposals.proposal` (FK-ээр холбогдсон)

---

## 1. Нэг удаагийн бэлтгэл (UTF-8 тохиргоо)

### 1.1 VS Code `settings.json`

`Ctrl+Shift+P` → **Preferences: Open User Settings (JSON)**

```json
"terminal.integrated.env.windows": {
  "PYTHONUTF8": "1",
  "PYTHONIOENCODING": "utf-8"
}
```

### 1.2 PowerShell `$PROFILE`

Файлыг нээх: `code $PROFILE`. Дотор нь нэмэх:

```powershell
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
```

Хадгалаад терминалаа шинээр нээнэ. Шалгах: `[Console]::OutputEncoding` → CodePage 65001.

### 1.3 Тэмдэглэл

- Windows 10 дээр өгөгдмөлөөр **Windows PowerShell 5.1** суусан байдаг. Шалгах: `$PSVersionTable.PSVersion`.
- PowerShell 7 хэрэгтэй бол: `winget install Microsoft.PowerShell`. Хоёр нь зэрэгцэн ажиллана, profile файл нь тус тусдаа.
- Скрипт ажиллахгүй алдаа гарвал нэг удаа: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- PowerShell 5.1 дээр `>` redirect нь UTF-16 бичдэг. **Хэзээ ч `>` ашиглахгүй, зөвхөн `-o` ашиглана.** `dumpdata -o` нь BOM-гүй UTF-8 бичдэг.

### 1.4 cmd терминал ашиглах бол

Dump/load командууд PowerShell-тэй яг ижил:

```cmd
python manage.py dumpdata users.user --indent 2 -o user.json
python manage.py dumpdata proposals.proposal --indent 2 -o proposal.json
python manage.py flush
python manage.py loaddata user.json
python manage.py loaddata proposal.json
```

**Python-ыг UTF-8 болгох**

```cmd
:: зөвхөн энэ терминалд
set PYTHONUTF8=1

:: байнга (хэрэглэгчийн түвшинд, шинээр нээсэн терминалд хүчинтэй)
setx PYTHONUTF8 1
setx PYTHONIOENCODING utf-8
```

VS Code дотор cmd ашигладаг бол 1.1-ийн `terminal.integrated.env.windows` тохиргоо cmd профайлд ч ажиллана.

**Терминалын кодчилол (кирилл зөв харагдахын тулд)**

```cmd
:: зөвхөн энэ терминалд
chcp 65001

:: байнга: cmd бүр эхлэхэд автоматаар ажиллана (registry AutoRun)
reg add "HKCU\Software\Microsoft\Command Processor" /v AutoRun /t REG_SZ /d "chcp 65001>nul" /f

:: буцаах
reg delete "HKCU\Software\Microsoft\Command Processor" /v AutoRun /f
```

**Анхаарах зүйл**

- `chcp 65001` нь зөвхөн дэлгэц дээрх харагдалтад нөлөөлнө. Dump файлын агуулгад нөлөөлөхгүй, файлыг `PYTHONUTF8=1` ба `-o` UTF-8 болгодог.
- AutoRun нь **зөвхөн cmd.exe** эхлэхэд ажиллана. PowerShell-д нөлөөгүй (PowerShell-д 1.2-ын `$PROFILE` хэрэгтэй).
- AutoRun нь cmd-г дуудсан бүх зүйлд (`.bat` скрипт, бусад програм) ажиллана. Хуучин OEM кодчилол (437, 866 гэх мэт) дээр найдсан скрипт байвал буруу ажиллаж болзошгүй. Асуудал гарвал AutoRun-г дээрх `reg delete`-ээр буцаа.
- cmd дээр `>` redirect нь PowerShell 5.1 шиг UTF-16 болгодоггүй. Гэхдээ `-o` нь хамгийн найдвартай тул үргэлжлүүлэн ашигла.
- Системийн хэмжээнд "Beta: Use Unicode UTF-8 for worldwide language support" (Region → Administrative → Change system locale) сонголт бий. Хуучин програмуудад нөлөөлж болзошгүй тул шаардлагагүй бол асаахгүй.
- 65001 хийсэн ч кирилл дэлгэц дээр буруу харагдвал терминалын фонт (жишээ нь Consolas) асуудал байж болно.

### 1.5 Си (C) програмд 65001 тохиргоо хэрэгтэй юу

Registry AutoRun-аар `chcp 65001` хийсэн бол cmd дотроос ажиллуулсан Си програм тэр кодчилолыг **өвлөж авна**. Тиймээс програмын эхэнд `SetConsoleOutputCP(CP_UTF8)` дуудах шаардлага ихэнх тохиолдолд байхгүй. Харин дараах нөхцөлүүдэд хамаарахгүй:

- **cmd-ээс биш эхэлсэн програм.** `.exe`-г давхар товшиж (шинэ console цонх нээгдэх үед) эсвэл AutoRun ажиллаагүй өөр орчноос ажиллуулбал console өгөгдмөл OEM кодчилолтой байна. Тэр үед програм өөрөө `SetConsoleOutputCP(CP_UTF8)` дуудах нь найдвартай.
- **PowerShell.** Registry AutoRun нөлөөгүй. Харин 1.2-ын `$PROFILE` дахь `[Console]::OutputEncoding = UTF8` нь console-ын кодчилолыг 65001 болгодог тул PowerShell-ээс ажиллуулсан Си програм мөн адил өвлөнө.
- **Эх кодын кодчилол.** Эх файл UTF-8 хадгалагдсан байх ёстой. MSVC-д `/utf-8` флаг хэрэгтэй. GCC/MinGW-д өгөгдмөл нь UTF-8.
- **Оролт (`scanf`, `fgets`).** 65001 дээр кирилл оролтыг унших нь зарим Windows хувилбар дээр найдваргүй байдаг. Ашиглах бол өөрийн машин дээрээ туршиж шалга.
- **Файлд бичих.** Кодчилол console-д нөлөөлдөг, файлд бичсэн байтуудад нөлөөлдөггүй. Файлд яг ямар байт бичигдэхийг програм өөрөө шийднэ.

Тиймээс практикт: өөрийн cmd/PowerShell дотроос ажиллуулах бол профайл/AutoRun хангалттай. Бусдад түгээх, давхар товшиж ажиллуулах програмд `SetConsoleOutputCP(CP_UTF8)`-ийг програмдаа үлдээх нь дээр.

#### Dev-C++ дээр бичиж туршиж байгаа бол

Dev-C++ дотроос ажиллуулахад (F10/F11) програмыг `ConsolePauser`-ээр шинэ console цонхонд эхлүүлдэг. Энэ нь cmd.exe-ийн **AutoRun-г дуудахгүй**, өгөгдмөл OEM кодчилолтой нээгдэнэ. Тиймээс IDE дотроос ажиллуулахад програмдаа өөрөө тохируулах хэрэгтэй:

```c
#include <stdio.h>
#include <windows.h>

int main(void) {
    SetConsoleOutputCP(CP_UTF8);  // гаралт
    SetConsoleCP(CP_UTF8);        // оролт (хэрэгтэй бол)
    printf("Сайн байна уу, Өнөөдөр Үйлдвэр\n");
    return 0;
}
```

- **Эх файлын кодчилол.** Dev-C++ хуучин хувилбарууд файлыг ANSI (системийн кодчилол)-оор хадгалдаг байж болно. Тэгвэл компайлер буруу байт авч, програм зөв кодчилолтой ч кирилл эвдэрнэ. Tools → Editor Options дотроос "encoding" гэж хайж default encoding-ийг UTF-8 болгоно (цэсний нэр хувилбараас хамаарч өөр байж болно). Хуучин файлуудыг UTF-8-аар дахин хадгал.
- **Фонт.** Console цонхны гарчиг дээр баруун товч → Properties → Font дээр **Consolas** сонго. Raster Fonts дээр кирилл хайрцаг болж харагдаж болно.
- **Шалгах.** IDE дотроос ажиллуулахад ч, cmd дээрээс `.exe`-г ажиллуулахад ч зөв харагдвал бүгд зөв. cmd дээр AutoRun-тай үед `SetConsoleOutputCP` давхардах боловч хор хөнөөлгүй.

---

## 2. Хадгалах (dump)

Хоёр хүснэгтийг тус тусад нь:

```powershell
python manage.py dumpdata users.user --indent 2 -o user.json
python manage.py dumpdata proposals.proposal --indent 2 -o proposal.json
```

Эсвэл нэг файлд:

```powershell
python manage.py dumpdata users.user proposals.proposal --indent 2 -o backup.json
```

Гол санаанууд:

- Файлын нэр ямар ч нөлөөгүй. `loaddata` нь файл доторх `"model": "users.user"` талбараар аль загварт бичихээ мэддэг.
- JSON нь `ensure_ascii=False` тул кирилл уншигдахуйц хэвээр гарна.
- `--natural-foreign`-ийг **ашиглахгүй** байх нь аюулгүй. Энэ нь загварт `natural_key()` / `get_by_natural_key()` шаарддаг, custom user загварт байхгүй байж болно. Ашиглахгүй бол FK нь энгийн id (тоо) хэлбэрээр гарна.
- `users.user` нь нууц үгийн hash, `last_login` агуулдаг. **JSON файлыг git рүү commit хийхгүй** (`.gitignore`-д нэм).

---

## 3. VS Code дээр харах, засах

- Баруун доод буланд `UTF-8` гэж байгааг шалга. Өөр бол дээр нь дарж **Reopen with Encoding → UTF-8**.
- `Shift+Alt+F` нь форматыг цэгцэлнэ.
- Бүтцийг хэвээр хадгал: `model`, `pk`, `fields` түлхүүрүүдийг өөрчлөхгүй. Зөвхөн `fields` доторх утгыг засна.
- **`pk`-г хэзээ ч өөрчлөхгүй.** Өөрчилбөл тэр мөр шинэ бичлэг болж, FK-ээр заасан бусад мөр хуучин id-г зааж үлдэнэ.
- Хэрэглэгчийн хувьд `users.json`-ийг засахгүй, зөвхөн `proposal.json`-г засна.

---

## 4. Баазыг цэвэрлэх

```powershell
python manage.py flush
```

- `flush` нь бүх хүснэгтийн мөрийг устгана, хүснэгтийн бүтцийг үлдээнэ. Дараа нь Django `contenttypes`, `auth.permission`-ийг дахин үүсгэнэ.
- Хэрэв баазыг бүхэлд нь drop/create хийвэл `python manage.py migrate` заавал хийнэ. `loaddata` хүснэгт **үүсгэдэггүй**.

---

## 5. Сэргээх (load)

Тусдаа файлуудаар бол **дараалал чухал**: эхлээд `users`, дараа нь `proposals`.

```powershell
python manage.py loaddata user.json
python manage.py loaddata proposal.json
```

Нэг файлд хадгалсан бол:

```powershell
python manage.py loaddata backup.json
```

### Холбоос яагаад алдагдахгүй вэ

- FK нь баазад `user_id = 5` гэсэн тоо хэлбэрээр хадгалагддаг. `proposal.json` дотор `"author": 5` гэж тоо байна.
- `pk` хэвээр орвол холбоос автоматаар сэргэнэ.
- Дараалал буруу (proposal эхэлж) бол заагдсан user байхгүй тул FK алдаа гарна.
- Primary key sequence-ийг Django өөрөө дараагийн id-д тааруулж шинэчилнэ.

### `loaddata` яаж ажилладаг вэ

- Ижил `pk`-тэй мөр байвал **шинэчилнэ**, байхгүй бол **нэмнэ**.
- Баазад байгаа бусад мөрийг устгахгүй. Тиймээс бүрэн сэргээлт хийхдээ эхлээд `flush` хийсэн байх ёстой.

---

## 6. Анхаарах зүйлс

| Асуудал | Тайлбар |
|---|---|
| `groups`, `user_permissions` | Id-гаар хадгалагдана. `flush`-ийн дараа permission-ы id өөр болж болзошгүй. Ашигладаг бол сэргээсний дараа хэрэглэгчийн эрхийг шалга. Ашигладаггүй бол асуудалгүй. |
| Бусад хүснэгт | `users.user` эсвэл `proposals.proposal`-г заадаг өөр хүснэгт (сэтгэгдэл, файл, review г.м.) `flush`-д устана. Хэрэгтэй бол тэдгээрийг бас `dumpdata`-даанд нэм. |
| Схем өөрчлөгдвөл | Dump хийснээс хойш загварт талбар нэмсэн/хассан бол хуучин JSON ачаалахад алдаа гарч болно. Dump-ыг тухайн үеийн migration-той нь тааруулж хадгал. |
| Нөөц | Цэвэрлэхээсээ өмнө `pg_dump` нөөц аваарай. JSON нь зөвхөн дурдсан хоёр хүснэгтийг хамарна. |
| Туршилт | Анх удаа үндсэн баазад биш, туршилтын бааз эсвэл хуулбар дээр `flush` → `loaddata` гүйлгэж шалга. |

---

## 7. Товч ажлын дараалал (cheat sheet)

```powershell
# 1. Хадгалах (нэг удаа users, шаардлагатай бүрд proposals)
python manage.py dumpdata users.user --indent 2 -o user.json
python manage.py dumpdata proposals.proposal --indent 2 -o proposal.json

# 2. (заавал биш) proposal.json-г VS Code дээр засах, pk-г хөндөхгүй

# 3. Баазыг цэвэрлэх
python manage.py flush
# бааз бүхэлдээ drop/create хийсэн бол: python manage.py migrate

# 4. Сэргээх (users эхэлж)
python manage.py loaddata user.json
python manage.py loaddata proposal.json
```

---

## 8. Өөр аргууд

**PostgreSQL түвшинд (Django-гүйгээр), SQL гаргана:**

```powershell
pg_dump -U user -d dbname -t table_name --data-only -f table.sql
psql -U user -d dbname -f table.sql
```

**Зарим мөрийг шүүж dump хийх** (`dumpdata` шүүлт дэмждэггүй тул shell-ээс):

```python
from django.core import serializers
from proposals.models import Proposal
qs = Proposal.objects.filter(year=2026)
with open("proposal.json", "w", encoding="utf-8") as f:
    serializers.serialize("json", qs, indent=2, ensure_ascii=False, stream=f)
```

Сэргээхдээ ердийн `loaddata` ашиглана.
