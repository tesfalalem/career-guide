import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/app_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  String? _selected;

  final _careers = [
    {'title': 'Software Engineer', 'icon': '💻', 'desc': 'Build apps & systems'},
    {'title': 'Data Scientist', 'icon': '📊', 'desc': 'Analyze & model data'},
    {'title': 'DevOps Engineer', 'icon': '⚙️', 'desc': 'Automate & deploy'},
    {'title': 'Cybersecurity', 'icon': '🛡️', 'desc': 'Protect systems'},
    {'title': 'Mobile Developer', 'icon': '📱', 'desc': 'Build mobile apps'},
    {'title': 'AI Engineer', 'icon': '🧬', 'desc': 'Build intelligent systems'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.teal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.teal.withOpacity(0.3)),
                ),
                child: const Text(
                  'WELCOME TO CAREERGUIDE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.teal,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                "What's your\ncareer goal?",
                style: Theme.of(context).textTheme.displayMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Pick a path to get your personalized roadmap',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 32),

              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.2,
                  ),
                  itemCount: _careers.length,
                  itemBuilder: (context, i) {
                    final career = _careers[i];
                    final isSelected = _selected == career['title'];
                    return GestureDetector(
                      onTap: () => setState(() => _selected = career['title']),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.navy
                              : Theme.of(context).cardTheme.color,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.navy
                                : AppColors.slate200,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(career['icon']!,
                                style: const TextStyle(fontSize: 32)),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  career['title']!,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                    color: isSelected
                                        ? Colors.white
                                        : Theme.of(context)
                                            .textTheme
                                            .titleMedium
                                            ?.color,
                                  ),
                                ),
                                Text(
                                  career['desc']!,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isSelected
                                        ? Colors.white60
                                        : AppColors.slate400,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              AppButton(
                label: 'Start My Journey',
                onPressed: _selected == null
                    ? null
                    : () => context.go('/student'),
                fullWidth: true,
              ),

              const SizedBox(height: 12),

              Center(
                child: TextButton(
                  onPressed: () => context.go('/student'),
                  child: const Text(
                    'Skip for now',
                    style: TextStyle(color: AppColors.slate400),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
