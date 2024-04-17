//Handling tooltip creation and behavior
export function createTooltip(tooltipDiv){
    //Creating the tooltip variable
    const tooltip = d3.select(tooltipDiv)
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-event", "none")
    
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const baseTemp = 8.66;

    //Specifying tooltip's data content and format
        function showTooltip(event, item) {
            const year = `${item["year"]}`;
            const monthIndex = item["month"];
            const month = monthNames[monthIndex - 1]
            const temp = `${(baseTemp + item["variance"]).toFixed(1)}`;
            const variance = `${item["variance"].toFixed(1)}`
            const tooltipText = variance < 0 ? `${year} - ${month}<br>${temp}°C<br>${variance}°C` : `${year} - ${month}<br>${temp}°C<br>+${variance}°C`;
            
            //Determining the tooltip's position respecting the mouse pointer
            tooltip.html(tooltipText)
                .attr("data-year", item["year"])
                .style("left", (event.pageX - 50) + "px")
                .style("top", (event.pageY - 90) + "px")
                .style("visibility", "visible")
        };

        //Hidding the tooltip when hovering out
        function hideTooltip() {
            tooltip.style("visibility", "hidden");
        };

        //Returning the functions for external uses
        return { showTooltip, hideTooltip }
};