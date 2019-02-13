 function checkin() {
     var view = {
         //  props: ['isLoad', 'labels_line', 'data_line'],
         template: '#view_tmp',
         data: function () {
             return {
                 formInline: {
                     projects: ['ALLI', 'ALLE', 'ALWP'],
                     daterange: [new Date('2018-01-01'), new Date('2018-12-31')]
                 },
                 pickerOptions: {
                     shortcuts: [{
                         text: 'Last week',
                         onClick(picker) {
                             const end = new Date();
                             const start = new Date();
                             start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                             picker.$emit('pick', [start, end]);
                         }
                     }, {
                         text: 'Last month',
                         onClick(picker) {
                             const end = new Date();
                             const start = new Date();
                             start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                             picker.$emit('pick', [start, end]);
                         }
                     }, {
                         text: 'Last three months',
                         onClick(picker) {
                             const end = new Date();
                             const start = new Date();
                             start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                             picker.$emit('pick', [start, end]);
                         }
                     }, {
                         text: 'Last year',
                         onClick(picker) {
                             const end = new Date();
                             const start = new Date();
                             start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                             picker.$emit('pick', [start, end]);
                         }
                     }, {
                         text: 'Last three years',
                         onClick(picker) {
                             const end = new Date();
                             const start = new Date();
                             start.setTime(start.getTime() - 3600 * 1000 * 24 * 1095);
                             picker.$emit('pick', [start, end]);
                         }
                     }]
                 },
                 chart_sapn: 22,
                 BKG: ['#60acfc', '#5bc49f', '#feb64d'],
                 isLoad: false,

                 labels_status: [],
                 datasets_status: [],
                 labels_h_status: [],
                 datasets_h_status: [],
                 labels_status_line: [],
                 datasets_status_line: [],
                 labels_issue: [],
                 datasets_issue: [],
                 labels_priority: [],
                 datasets_priority: [],
                 labels_discover: [],
                 datasets_discover: [],
                 labels_component: [],
                 datasets_component: [],
                 labels_version: [],
                 datasets_version: []
             }
         },
         created: function () {
             this.$nextTick(function () {
                 this.drawCharts();
             });
         },
         methods: {
             onSubmit() {
                 console.log(this.formInline);
                 var daterange = this.formInline.daterange;
                 var projects = this.formInline.projects;
                 var filters = null;
                 if (daterange.length == 2 && projects.length >= 1) {
                     filters = Object.create(null);
                     filters.projects = projects.join(',');
                     var dr = daterange.map(function (v) {
                         var fmt = (s) => ('' + s).length == 1 ? ('0' + s) : ('' + s);
                         var y = v.getFullYear();
                         var m = fmt(v.getMonth() * 1 + 1);
                         var d = fmt(v.getDate());
                         return y + '-' + m + '-' + d;
                     });
                     console.log(dr);
                     filters.daterange = dr.join(',');
                 } else {
                     filters.projects = ['ALLI', 'ALLE', 'ALWP'].join(',');
                     filters.daterange = ['2018-01-01', '2018-12-31'].join(',');
                 }
                 this.isLoad = false;
                 this.drawCharts(filters);
             },
             drawCharts(filters) {
                 var url = '/api/data';
                 if (filters) {
                     url += '/' + filters.projects;
                     url += '/' + filters.daterange;
                 }
                 this.$http.get(url).then(function (res) {
                     this.isLoad = true;
                     var chart_data_set = res.body;
                     this.drawBar(chart_data_set['status'], 'status_fs', (_axis, _data) => {
                         this.labels_status = _axis;
                         this.datasets_status = _data;
                     });
                     this.drawBar(chart_data_set['issue'], 'issue_fs', (_axis, _data) => {
                         this.labels_issue = _axis;
                         this.datasets_issue = _data;
                     });
                     this.drawBar(chart_data_set['priority'], 'priority_fs', (_axis, _data) => {
                         this.labels_priority = _axis;
                         this.datasets_priority = _data;
                     });

                     this.drawLine(chart_data_set['status'], 'status_line_fs', (_axis, _data) => {
                         this.labels_status_line = _axis;
                         this.datasets_status_line = _data;
                     });
                     this.drawHorizontalBar(chart_data_set['status'], 'status_h_fs', (_axis, _data) => {
                         this.labels_h_status = _axis;
                         this.datasets_h_status = _data;
                     });
                     this.drawHorizontalBar(chart_data_set['version'], 'version_fs', (_axis, _data) => {
                         this.labels_version = _axis;
                         this.datasets_version = _data;
                     });
                     this.drawHorizontalBar(chart_data_set['discover'], 'discover_fs', (_axis, _data) => {
                         this.labels_discover = _axis;
                         this.datasets_discover = _data;
                     });

                 }, function () {
                     console.log('Request failed.');
                 });
             },
             drawHorizontalBar(chart_data_set, id, callback) {
                 var chart_data = JSON.parse(JSON.stringify(chart_data_set));
                 var data = chart_data.data;
                 var labels = chart_data.x_axis;
                 var label = chart_data.label;
                 var data_set = [];
                 for (var i = 0, len = data.length; i < len; i++) {
                     var item = data[i];
                     var _d = [];
                     for (var k = 0, k_len = labels.length; k < k_len; k++) {
                         _d.push(item[labels[k]]);
                     }
                     var ds = {};
                     ds.label = label[i];
                     ds.backgroundColor = this.BKG[i];
                     ds.data = _d;
                     data_set.push(ds);
                 }

                 callback(labels, data_set)
                 setTimeout(() => this.generate_image(id), 10);
             },
             drawBar(chart_data_set, id, callback) {
                 var chart_data = JSON.parse(JSON.stringify(chart_data_set));
                 var data = chart_data.data;
                 var labels = chart_data.label;
                 var x_axis = chart_data.x_axis;
                 var data_set = [];
                 for (var i = 0, len = labels.length; i < len; i++) {
                     var item = data[i];
                     var _d = [];
                     for (var k = 0, k_len = x_axis.length; k < k_len; k++) {
                         _d.push(item[x_axis[k]]);
                     }
                     var ds = {};
                     ds.label = labels[i];
                     ds.backgroundColor = this.BKG[i];
                     ds.data = _d;
                     data_set.push(ds);
                 }

                 callback(x_axis, data_set);
                 setTimeout(() => this.generate_image(id), 10);
             },
             drawLine(chart_data_set, id, callback) {
                 var chart_data = JSON.parse(JSON.stringify(chart_data_set));
                 var data = chart_data.data;
                 var labels = chart_data.label;
                 var x_axis = chart_data.x_axis;
                 var data_set = [];
                 for (var i = 0, len = labels.length; i < len; i++) {
                     var item = data[i];
                     var _d = [];
                     for (var k = 0, k_len = x_axis.length; k < k_len; k++) {
                         _d.push(item[x_axis[k]]);
                     }
                     var ds = {};
                     ds.label = labels[i];
                     ds.borderColor = this.BKG[i]; //路径颜色
                     ds.pointBackgroundColor = this.BKG[i]; //数据点颜色
                     ds.pointBorderColor = '#fff';
                     ds.data = _d;
                     data_set.push(ds);
                 }
                 callback(x_axis, data_set);
                 setTimeout(() => this.generate_image(id), 10);
             },
             generate_image(chart_key) {
                 var fd = document.getElementById(chart_key);
                 var canvas = fd.getElementsByTagName('canvas')[0];
                 var image = canvas.toDataURL({
                     type: "png",
                     backgroundColor: '#fff', //不设置此项，导出图片的底色是黑色
                 });
                 var a_lk = fd.getElementsByTagName('a')[0];
                 a_lk.href = image;
             }
         }
     };
     var setting = {
         template: '#setting_tmp',
         data: function () {
             return {
                 ctl: {
                     steps: ['isProject', 'isChart', 'isDone'],
                     isProject: true,
                     isChart: false,
                     isDone: false
                 },
                 basic_chart: [{
                         name: 'TicketChart',
                         desc: 'Show the different counts of tickets.',
                         type: 'bar',
                     },
                     {
                         name: 'CustomersChart',
                         desc: 'Show the different counts of customers.',
                         type: 'bar',
                     },
                     {
                         name: 'PriorityChart',
                         desc: 'Show the different counts of priority.',
                         type: 'bar',
                     },
                     {
                         name: 'StatusChart',
                         desc: 'Show the different counts of status.',
                         type: 'bar',
                     }
                 ],
                 chart_types: ['bar', 'line', 'pie'],
                 default_counts: 5,
                 colors: [
                     ['#5bc49'],
                     ['#5bc49', '#feb64d'],
                     ['#60acfc', '#5bc49f', '#feb64d'],
                     ['#60acfc', '#5bc49f', '#feb64d', '#ff7c7c'],
                     ['#60acfc', '#5bc49f', '#b3d52b', '#feb64d', '#ff7c7c']
                 ],
                 active: 0,
                 project_info: {
                     name: '',
                     key: '',
                     desc: ''
                 },
                 project_set: [],
                 p_idx: 0,
                 chart_info: {
                     name: '',
                     type: '',
                     desc: ''
                 },
                 chart_set: [],
                 c_idx: 0,
                 btn_disabled: false,
             }
         },
         methods: {
             next() {
                 if (this.active++ > 2) this.active = 0;
                 for (var i = 0, len = this.ctl.steps.length; i < len; i++) {
                     if (this.active == i) {
                         this.ctl[this.ctl.steps[i]] = true;
                     } else {
                         this.ctl[this.ctl.steps[i]] = false;
                     }
                 }
             },
             reset() {
                 this.active = 0;
                 this.ctl.isProject = true;
                 this.ctl.isChart = false;
                 this.ctl.isDone = false;
                 this.project_info = {};
                 this.project_set = [];
                 this.p_idx = 0;
                 this.chart_info = {};
                 this.chart_set = [];
                 this.c_idx = 0;
                 this.btn_disabled = false;
             },
             save_project() {
                 this.add_project();
                 this.next();
             },
             add_project() {
                 if (this.project_info.name && this.project_info.key) {
                     this.project_set.push(this.project_info);
                     this.project_info = {};
                     this.p_idx++;
                 }
             },

             save_chart() {
                 this.add_chart();
                 this.next();
             },
             add_chart() {
                 if (this.chart_info.name && this.chart_info.type) {
                     this.chart_set.push(this.chart_info);
                     this.chart_info = {};
                     this.c_idx++;
                 }
             },

             onSubmit() {
                 // console.log(this.project_set);
                 // console.log(this.chart_set);
                 this.active++;
                 this.btn_disabled = true;
                 // console.log(this.active)
             },
         }
     };
     var no_found = {
         template: '<div>404 page</div>'
     };

     var routesCfg = [{
             path: '/',
             redirect: '/view',
             component: view
         },
         {
             path: '/view',
             component: view
         },
         {
             path: '/settings',
             component: setting
         },
         {
             path: '/no_found',
             component: no_found
         },
         {
             path: '*',
             redirect: '/no_found'
         }
     ];
     var router = new VueRouter({
         routes: routesCfg
     });
     var app = new Vue({
         delimiters: ['${', '}'],
         router: router,
         data: {
             debug: false
         }
     });
     app.$mount('#app');
 }
 window.onload = checkin;