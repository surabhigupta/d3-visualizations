(function () {
    'use strict';
    /*global token */
    /*global full_name */
    angular.module('VisualizationApp', [])
        .controller('MainController', ['$scope', function ($scope) {

            $scope.datasets = [
                {
                    name: "Insertions",
                    data_type: "insertions"
                },
                {
                    name: "Deletions",
                    data_type: "deletions"
                },
                {
                    name: "Files Changed",
                    data_type: "files_changed"
                },
                {
                    name: "Commits",
                    data_type: "commits"
                }
            ];
            $scope.selectedDataset = $scope.datasets[0];
            $scope.showCursorText = false;
            $scope.hoverText = "";

            $scope.drawChart = function () {
                var dataType = $scope.selectedDataset.data_type;
                var title = $scope.selectedDataset.name;
                d3.select("#chart").selectAll("svg").remove();

                var svg = d3.select("#chart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var scale = d3.scale.pow().exponent(.2)
                    .domain([d3.min($scope.data, function (d) {
                        return d[dataType];
                    }), d3.max($scope.data, function (d) {
                        return d[dataType];
                    })])
                    .range([0, colors.length - 1]);

                svg.selectAll("rect")
                    .data($scope.data)
                    .enter()
                    .append("rect")
                    .attr("x", function (d) {
                        return d.hour * gridSize;
                    })
                    .attr("y", function (d) {
                        return (d.day - 1) * gridSize
                    })
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("width", gridSize)
                    .attr("height", gridSize)
                    .attr("class", "bordered")
                    .style("fill", function (d) {
                        return colors[Math.floor(scale(d[dataType]))];
                    })
                    .style("fill-opacity", 0.8)
                    .on('mouseover', function (d) {
                        $scope.$apply(function (){
                        $scope.hoverText = d[dataType];
                        })
                    })
                    .on('mouseout', function (d) {
                        $scope.$apply(function () {
                            $scope.hoverText = "";
                        });
                    });

                svg.selectAll("text")
                    .data($scope.data)
                    .enter()
                    .append("text")
                    .text(function (d) {
                        return d[dataType];
                    })
                    .attr("x", function (d, i) {
                        return d.hour * gridSize + gridSize * 5 / 6;
                    })
                    .attr("y", function (d) {
                        return (d.day - 1 ) * gridSize + gridSize * 5 / 6;
                    })
                    .style("text-anchor", "end")
                    .style("fill", function (d) {
                        return colors[colors.length - Math.floor(scale(d[dataType]))]
                    });

                svg.selectAll(".dayLabel")
                    .data(days)
                    .enter().append("text")
                    .text(function (d) {
                        return d;
                    })
                    .attr("x", 0)
                    .attr("y", function (d, i) {
                        return i * gridSize;
                    })
                    .style("text-anchor", "end")
                    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
                    .attr("class", function (d, i) {
                        return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
                    });

                svg.selectAll(".timeLabel")
                    .data(times)
                    .enter().append("text")
                    .text(function (d) {
                        return d;
                    })
                    .attr("x", function (d, i) {
                        return i * gridSize;
                    })
                    .attr("y", 0)
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                    .attr("class", function (d, i) {
                        return ((i >= 2 && i <= 4) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
                    });
            };

            var width = 400,
                height = 420,
                margin = {top: 30, right: 10, bottom: 30, left: 30},
                gridSize = 64,
                colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
                days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
                times = ["12a-4a", "4a-8a", "8a-12p", "12p-4p", "4p-8p", "8p-12a"];

            var heatMap = function (csvFile) {
                d3.tsv(csvFile, function (d) {
                        return {
                            day: +d.day,
                            hour: +d.hour,
                            files_changed: +d.files_changed,
                            insertions: +d.insertions,
                            deletions: +d.deletions,
                            commits: +d.commits
                        };
                    },
                    function (error, data) {
                        $scope.data = data;
                        $scope.drawChart();
                    });
            };

            heatMap("heatmap.tsv");

            $(document).mousemove(function (e) {
                $scope.showCursorText = true;
                var cpos = {top: e.pageY + 10, left: e.pageX + 10};
                $('#hover-text').offset(cpos);
            });

        }]);
}());