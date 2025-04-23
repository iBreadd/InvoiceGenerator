let itemCount = 1;

function addItem() {
    itemCount++;
    const itemsDiv = document.getElementById('items');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" class="item-num" placeholder="№" value="${itemCount}">
        <input type="text" class="item-name" placeholder="Наименование">
        <input type="number" class="item-quantity" placeholder="Количество" step="0.01">
        <input type="number" class="item-price" placeholder="Ед. Цена" step="0.01">
    `;
    itemsDiv.appendChild(newItem);
}

function getValue(id) {
    return document.getElementById(id).value || '---';
}

function generateInvoice() {
    const preview = document.getElementById('invoicePreview');
    preview.classList.remove('hidden');
    preview.style.display = 'block';

    // Populate invoice details
    document.getElementById('previewInvoiceNumber').textContent = `Фактура №: ${getValue('invoiceNumber')}`;
    document.getElementById('previewInvoiceDate').textContent = `Дата: ${getValue('invoiceDate')}`;
    document.getElementById('previewTaxEventDate').textContent = `Дата на данъчно събитие: ${getValue('taxEventDate')}`;
    document.getElementById('previewSupplierName').textContent = getValue('supplierName');
    document.getElementById('previewSupplierAddress').textContent = getValue('supplierAddress');
    document.getElementById('previewSupplierId').textContent = `ЕИК: ${getValue('supplierId')}`;
    document.getElementById('previewSupplierMol').textContent = `МОЛ: ${getValue('supplierMol')}`;
    document.getElementById('previewSupplierPhone').textContent = `Телефон: ${getValue('supplierPhone')}`;
    document.getElementById('previewRecipientName').textContent = getValue('recipientName');
    document.getElementById('previewRecipientAddress').textContent = getValue('recipientAddress');
    document.getElementById('previewRecipientId').textContent = `ЕИК: ${getValue('recipientId')}`;
    document.getElementById('previewRecipientMol').textContent = `МОЛ: ${getValue('recipientMol')}`;
    document.getElementById('previewBank').textContent = `Банка: ${getValue('bank')}`;
    document.getElementById('previewIban').textContent = `IBAN: ${getValue('iban')}`;
    document.getElementById('previewBankCode').textContent = `БИК: ${getValue('bankCode')}`;
    document.getElementById('previewSupplierPhoneFooter').textContent = getValue('supplierPhone');

    // Populate items
    const itemRows = document.querySelectorAll('.item-row');
    const previewItems = document.getElementById('previewItems');
    previewItems.innerHTML = '';
    let subtotal = 0;

    itemRows.forEach(row => {
        const num = row.querySelector('.item-num').value || '';
        const name = row.querySelector('.item-name').value || '';
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = (quantity * price).toFixed(2);
        subtotal += parseFloat(total);

        const tr = document.createElement('tr');
        tr.className = 'border-b';
        tr.innerHTML = `
            <td class="p-4 text-gray-600">${num}</td>
            <td class="p-4 text-gray-600">${name}</td>
            <td class="p-4 text-gray-600">${quantity.toFixed(2)}</td>
            <td class="p-4 text-gray-600">${price.toFixed(2)} лв</td>
            <td class="p-4 text-gray-600">${total} лв</td>
        `;
        previewItems.appendChild(tr);
    });

    const tax = subtotal * 0.2;
    const total = subtotal + tax;

    document.getElementById('previewSubtotal').textContent = `${subtotal.toFixed(2)} лв`;
    document.getElementById('previewTax').textContent = `${tax.toFixed(2)} лв`;
    document.getElementById('previewTotal').textContent = `${total.toFixed(2)} лв`;
}

async function generatePDF() {
    const element = document.getElementById('invoicePreview');

    // Дебъг: Проверяваме дали елементът съдържа съдържание
    console.log('Element content before rendering:', element.innerHTML);
    console.log('Element visibility:', element.style.display);
    console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);

    // Уверете се, че елементът е видим
    element.style.display = 'block';
    element.style.width = '100%';
    element.style.maxWidth = '210mm'; // A4 ширина
    element.style.padding = '20px';
    element.style.background = 'white';

    // Скриваме бутоните, които не искаме да се показват в PDF-а
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');

    // Изчакваме изображението да се зареди
    const logo = document.getElementById('invoiceLogo');
    const logoFallback = document.getElementById('logoFallback');
    let logoLoaded = false;

    if (logo) {
        logoLoaded = await new Promise(resolve => {
            if (logo.complete) {
                resolve(true);
            } else {
                logo.onload = () => resolve(true);
                logo.onerror = () => {
                    console.error('Грешка при зареждане на логото');
                    resolve(false);
                };
                setTimeout(() => resolve(false), 3000);
            }
        });
    }

    if (!logoLoaded && logo && logoFallback) {
        console.warn('Логото не можа да се зареди, продължаваме без него');
        logo.style.display = 'none';
        logoFallback.style.display = 'block';
    }

    // Изчисляваме размерите на елемента
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    console.log('Calculated element dimensions for canvas:', elementWidth, elementHeight);

    const opt = {
        margin: 10,
        filename: `factura_${getValue('invoiceNumber') || '001'}.pdf`,
        image: { 
            type: 'jpeg', 
            quality: 0.98 
        },
        html2canvas: { 
            scale: 2,
            logging: true,
            useCORS: false,
            allowTaint: true,
            width: elementWidth,
            height: elementHeight,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };

    // Увеличаваме времето за изчакване
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Добавяме стиловете директно в елемента за PDF рендиране
    const style = document.createElement('style');
    style.textContent = `
        .no-print { display: none !important; }
        .hidden { display: block !important; }
        .item-row input { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 4px; }
        .item-row { display: flex; gap: 10px; margin-bottom: 10px; }
        #invoicePreview { 
            background: white; 
            padding: 20px; 
            display: block !important; 
            width: 100%; 
            max-width: 210mm; 
        }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .font-bold { font-weight: 700; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-600 { color: #4b5563; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .font-semibold { font-weight: 600; }
        .mb-8 { margin-bottom: 2rem; }
        .p-4 { padding: 1rem; }
        .w-full { width: 100%; }
        .text-left { text-align: left; }
        .bg-gray-200 { background-color: #e5e7eb; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .justify-end { justify-content: flex-end; }
        .items-center { align-items: center; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .w-1/3 { width: 33.333333%; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-8 { gap: 2rem; }
        .text-center { text-align: center; }
        .h-12 { height: 3rem; }
    `;
    element.appendChild(style);

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error('Грешка при генериране на PDF:', error);
    } finally {
        element.removeChild(style);
        noPrintElements.forEach(el => el.style.display = '');
        element.style.width = '';
        element.style.maxWidth = '';
        if (logoLoaded && logo && logoFallback) {
            logo.style.display = 'block';
            logoFallback.style.display = 'none';
        }
    }
}