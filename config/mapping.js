module.exports = {
    hikeup: {
        invoiceFile: {
            mapping: {
                invoiceId: 'Invoice ID',
                invoiceStatus: 'Invoice Status',
                invoiceType: 'Invoice Type',
                creationDatetime: 'Creation Datetime',
                modificationDatetime: 'Modification Datetime',
                customerId: 'Customer ID',
                quantity: 'Quantity',
                sellTotal: 'Sell Total',
                tax1Total: 'Tax1 Total',
                taxCodeId: 'Tax Code ID',
                tax1Rate: 'Tax1 Rate',
                total: 'Total',
                totalPaid: 'Total Paid',
                paymentAmount1: 'Payment Amount 1',
                paymentMethod1: 'Payment Method 1',
                paymentType1: 'Payment Type 1'
            }
        },
        invoiceItemFile: {
            mapping: {
                invoiceId: 'Invoice ID',
                creationDate: 'Creation Date',
                customerId: 'Customer ID',
                quantityLineItem: 'Quantity (Line Item)',
                productCode: 'Product Code',
                sellLineItem: 'Sell (Line Item)',
                tax1Total: 'Tax1 Total (Line Item)',
                total: 'Total',
                taxName: 'Tax Name'
            }
        },
        locations: {
            mapping: {
                id: 'id',
                name: 'title',
                taxId: 'taxId',
                isActive: 'isActive'
            }
        },
        registers: {
            mapping: {
                id: 'id',
                name: 'name',
                outletId: 'outletID',
                defaultTax: 'defaultTax',
                prefix: 'prefix',
                suffix: 'suffix',
                isActive: 'isActive',
            }
        },
        products: {
            mapping: {
                id: 'id',
                name: 'name',
                description: 'description',
                sku: 'sku',
                barcode: 'barcode',
                brandId: 'brand_id',
                beandName: 'bran_name',
                isActive: 'isActive'
            }
        },
        customers: {
            mapping: {
                id: 'id',
                firstName: 'first_name',
                lastName: 'first_name',
                customerCode: 'customer_code',
                companyName: 'company_name',
                isActive: 'isActive'
            }
        },
        taxes: {
            mapping: {
                id: 'id',
                name: 'name',
                rate: 'rate',
                isActive: 'isActive'
            }
        },
        payments: {
            mapping: {
                id: 'id',
                name: 'payment_name',
                paymentOptionType: 'payment_option_type',
                paymentOptionName: 'payment_option_name',
                isActive: 'isActive'
            }
        }

    }
};