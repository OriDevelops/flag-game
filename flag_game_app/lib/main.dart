import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_static/shelf_static.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await setupServer();
  runApp(const MyApp());
}

Future<void> setupServer() async {
  final dir = await getTemporaryDirectory();
  final webDir = Directory('${dir.path}/web');
  await webDir.create(recursive: true);
  
  final files = ['index.html', 'assets/index.js', 'assets/index.css'];
  for (final file in files) {
    final data = await rootBundle.load('assets/dist/$file');
    final f = File('${webDir.path}/$file');
    await f.parent.create(recursive: true);
    await f.writeAsBytes(data.buffer.asUint8List());
  }
  
  final handler = createStaticHandler(webDir.path, defaultDocument: 'index.html');
  await shelf_io.serve(handler, '127.0.0.1', 8080);
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: FlagGame());
  }
}

class FlagGame extends StatefulWidget {
  const FlagGame({super.key});

  @override
  State<FlagGame> createState() => _FlagGameState();
}

class _FlagGameState extends State<FlagGame> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(
            url: WebUri('http://127.0.0.1:8080'),
          ),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
          ),
        ),
      ),
    );
  }
}
