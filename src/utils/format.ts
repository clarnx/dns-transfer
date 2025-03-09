const formatDate = (date: any) => {

    if (date !== undefined) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',  // "Sun"
            month: 'long',     // "May"
            day: '2-digit',    // "12"
            year: 'numeric',   // "2024"
            hour: 'numeric',   // "5"
            minute: '2-digit', // "16"
            hour12: true       // "PM"
        }).format(date);
    }

};

export { formatDate };