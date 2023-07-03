import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
	history: createWebHashHistory(),
	routes: [{
		path: '/',
		name: 'home',
		component: HomeView
	}]
});

// router.beforeEach((to, from, next) => {
// 	if (!to.name) {
// 		next({ name: 'home' });
// 	} else {
// 		next();
// 	}
// });

export default router;
