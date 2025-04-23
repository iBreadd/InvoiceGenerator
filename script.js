document.addEventListener('DOMContentLoaded', function() {
    // Добавяне на нов артикул
    document.getElementById('addItem').addEventListener('click', function() {
        const itemsDiv = document.getElementById('items');
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.innerHTML = `
            <input type="text" placeholder="Описание" class="item-desc">
            <input type="number" placeholder="Количество" class="item-qty">
            <input type="number" placeholder="Цена" class="item-price">
            <button class="remove-item">Премахни</button>
        `;
        itemsDiv.appendChild(newItem);
        
        newItem.querySelector('.remove-item').addEventListener('click', function() {
            itemsDiv.removeChild(newItem);
        });
    });
    
    // Генериране на фактура
    document.getElementById('generateInvoice').addEventListener('click', function() {
        // Взимане на основните данни
        document.getElementById('invNum').textContent = document.getElementById('invoiceNumber').value || 'Ф-001';
        document.getElementById('invDate').textContent = formatDate(document.getElementById('date').value) || '01.01.2023';
        document.getElementById('invProvider').textContent = document.getElementById('providerName').value || 'Доставчик ООД';
        document.getElementById('invClient').textContent = document.getElementById('clientName').value || 'Клиент ЕООД';
        
        // Обработка на артикулите
        const itemRows = document.querySelectorAll('.item-row');
        let total = 0;
        
        const invItemsTbody = document.getElementById('invItems');
        invItemsTbody.innerHTML = '';
        
        itemRows.forEach(row => {
            const desc = row.querySelector('.item-desc').value || 'Артикул';
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const sum = qty * price;
            total += sum;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${desc}</td>
                <td>${qty}</td>
                <td>${price.toFixed(2)}</td>
                <td>${sum.toFixed(2)}</td>
            `;
            invItemsTbody.appendChild(tr);
        });
        
        document.getElementById('invTotal').textContent = total.toFixed(2);
        
        // Генериране на PDF след кратко забавяне
        setTimeout(() => {
            const element = document.getElementById('invoicePreview');
            const opt = {
                margin: 10,
                filename: `factura_${document.getElementById('invoiceNumber').value || '001'}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    logging: true,
                    useCORS: true,
                    allowTaint: true,
                    scrollX: 0,
                    scrollY: 0
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };
            
            html2pdf().set(opt).from(element).save();
        }, 500);
    });
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
});