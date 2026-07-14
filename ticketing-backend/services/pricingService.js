const { Op } = require("sequelize");

const RULES = [
    [true,  false, false, 0],
    [true,  false, true,  5],
    [true,  true,  false, 10],
    [true,  true,  true,  15],
    [false, false, false, 5],
    [false, false, true,  10],
    [false, true,  false, 15],
    [false, true,  true,  20],
];

/**
 * Total tiket terjual seluruh kategori dalam event
 */
const getTotalSold = async (db, eventId) => {

    const total = await db.Ticket.sum("ticket_sold", {
        where: {
            event_id: eventId
        }
    });

    return total || 0;
};

/**
 * Total penjualan 1 jam terakhir
 */
const getSalesPerHour = async (db, eventId) => {

    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));

    const tickets = await db.Ticket.findAll({
        where: {
            event_id: eventId
        },
        attributes: ["ticket_id"]
    });

    const ids = tickets.map(t => t.ticket_id);

    const total = await db.Transaction.sum("quantity", {

        where: {

            ticket_id: {
                [Op.in]: ids
            },

            order_date: {
                [Op.gte]: oneHourAgo
            },

            transaction_status: "success"

        }

    });

    return total || 0;
};

/**
 * Selisih hari menuju event
 */
const getDaysToEvent = (eventDate) => {

    return (

        new Date(eventDate) - new Date()

    ) / (1000 * 60 * 60 * 24);

};

/**
 * Convert persentase estimasi kehadiran jadi label kategori
 */
const getCrowdLabel = (percent) => {

    if (percent >= 75) return "Ramai";
    if (percent >= 50) return "Sedang";
    if (percent >= 25) return "Sepi";
    if (percent >= 0) return "Sangat Sepi";
    return "Sepi";

};

/**
 * Recalculate seluruh harga tiket dalam event
 */
const recalculateTicketPrice = async (db, ticket) => {

    try {

        //--------------------------------------
        // Ambil Event
        //--------------------------------------

        const event = await db.Event.findByPk(ticket.event_id);

        if (!event) {
            console.log("Event tidak ditemukan.");
            return;
        }

        //--------------------------------------
        // Hitung kondisi event
        //--------------------------------------

        const totalSold = await getTotalSold(
            db,
            event.event_id
        );

        const remainingTicket =
            event.max_capacity - totalSold;

        const sisaLebih50 =
            remainingTicket >
            (event.max_capacity / 2);

        const salesPerHour =
            await getSalesPerHour(
                db,
                event.event_id
            );

        const cepatLaku =
            salesPerHour >= 5;

        const daysToEvent =
            getDaysToEvent(
                event.event_date
            );

        const dekat3Hari =
            daysToEvent <= 3;

        //--------------------------------------
        // Decision Tree
        //--------------------------------------

        const rule = RULES.find(

            ([s, c, d]) =>

                s === sisaLebih50 &&
                c === cepatLaku &&
                d === dekat3Hari

        );

        const increasePercent =
            rule ? rule[3] : 0;

        //--------------------------------------
        // Ambil semua kategori tiket
        //--------------------------------------

        const tickets = await db.Ticket.findAll({

            where: {

                event_id: event.event_id

            }

        });

        //--------------------------------------
        // Update seluruh kategori tiket
        //--------------------------------------

        for (const tk of tickets) {

            const oldPrice = tk.current_price;

            const newPrice = Math.round(

                tk.base_price *

                (1 + increasePercent / 100)

            );

            if (oldPrice !== newPrice) {

                await tk.update({

                    current_price: newPrice

                });

            }

            console.log(`
========== Dynamic Pricing ==========
Event              : ${event.event_title}
Kategori           : ${tk.ticket_category}

Max Capacity       : ${event.max_capacity}
Total Sold         : ${totalSold}
Remaining Ticket   : ${remainingTicket}

Sales / Hour       : ${salesPerHour}
Days To Event      : ${daysToEvent.toFixed(2)}

Rule               : ${rule ? RULES.indexOf(rule) + 1 : "-"}

Increase           : ${increasePercent}%

Old Price          : Rp${oldPrice.toLocaleString()}
New Price          : Rp${newPrice.toLocaleString()}
=====================================
`);

        }

    }
    catch (err) {

        console.error("[PricingService]", err);

    }

};

/**
 * Estimasi crowd/kehadiran berdasarkan kecepatan sold out
 * (root node dari decision tree crowd estimation)
 *
 * Cabang Kategori Tiket / Wishlist / Popularitas
 * belum diimplementasi karena data belum tersedia.
 */
const estimateCrowd = async (db, eventId) => {

    try {

        //--------------------------------------
        // Ambil Event
        //--------------------------------------

        const event = await db.Event.findByPk(eventId);

        if (!event) {
            console.log("Event tidak ditemukan.");
            return null;
        }

        //--------------------------------------
        // Hitung kondisi event
        //--------------------------------------

        const totalSold = await getTotalSold(
            db,
            event.event_id
        );

        const remainingTicket =
            event.max_capacity - totalSold;

        const sisaLebih50 =
            remainingTicket >
            (event.max_capacity / 2);

        //--------------------------------------
        // Root Decision: Kecepatan Sold Out
        //--------------------------------------
        // sisaLebih50 true  => sisa > 50% => Lambat
        // sisaLebih50 false => sisa <= 50% => Cepat

        const isCepat = !sisaLebih50;

        let estimatedAttendance;
        let note;

        if (isCepat) {

            // Sisa tiket 1-50% => sold cepat => leaf langsung
            estimatedAttendance = 90;
            note = "Sold Out Cepat (sisa tiket <= 50%)";

        } else {

            // Sisa tiket 51-100% => sold lambat
            // TODO: lanjutkan ke cabang Kategori Tiket / Wishlist / Popularitas
            // Sementara pakai rata-rata dari 8 leaf (58%-88%) sbg placeholder
            estimatedAttendance = 74;
            note = "Sold Out Lambat (sisa tiket > 50%) - estimasi sementara, cabang lanjutan belum diimplementasi";

        }

        const crowdLabel = getCrowdLabel(estimatedAttendance);

        console.log(`
========== Crowd Estimation ==========
Event              : ${event.event_title}
Max Capacity       : ${event.max_capacity}
Total Sold         : ${totalSold}
Remaining Ticket   : ${remainingTicket}

Kecepatan Sold Out : ${isCepat ? "Cepat" : "Lambat"}
Estimasi Kehadiran : ${estimatedAttendance}%
Label Crowd        : ${crowdLabel}
Catatan            : ${note}
=======================================
`);

        return {
            event_id: event.event_id,
            max_capacity: event.max_capacity,
            total_sold: totalSold,
            remaining_ticket: remainingTicket,
            kecepatan_sold_out: isCepat ? "Cepat" : "Lambat",
            estimated_attendance: estimatedAttendance,
            crowd_label: crowdLabel,
            note
        };

    } catch (err) {

        console.error("[CrowdEstimationService]", err);
        return null;

    }

};

module.exports = {
    recalculateTicketPrice,
    estimateCrowd,
    getCrowdLabel
};